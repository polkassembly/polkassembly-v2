// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { BN } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import { EDelegateSource, ENetwork, IDelegate, IDelegateData, IDelegateStats } from '@/_shared/types';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../_api-utils/apiError';
import { OnChainDbService } from '../../_api-services/onchain_db_service';
import { OffChainDbService } from '../../_api-services/offchain_db_service';
import { w3fDelegatesKusama, w3fDelegatesPolkadot } from '../../_api-constants/delegateData';

// Types
export interface IDelegationData {
	votingDelegations: Array<{
		balance: string;
		lockPeriod?: string;
		from: string;
	}>;
}

export interface IDelegateSource {
	address: string;
	bio: string;
	image: string;
	dataSource: EDelegateSource[];
	username?: string;
}

export interface IDelegateSourceConfig {
	bioKey: string;
	source: EDelegateSource;
	usernameKey: string;
	imageKey?: string;
	url?: (network: ENetwork) => string;
}

// Constants
const DELEGATE_SOURCES = {
	nova: {
		bioKey: 'shortDescription',
		imageKey: 'image',
		source: EDelegateSource.NOVA,
		url: (network: ENetwork) => `https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/master/registry/${network}.json`,
		usernameKey: 'username'
	},
	parity: {
		bioKey: 'manifesto',
		imageKey: 'image',
		source: EDelegateSource.PARITY,
		url: (network: ENetwork) => `https://paritytech.github.io/governance-ui/data/${network}/delegates.json`,
		usernameKey: 'username'
	},
	polkassembly: {
		bioKey: 'bio',
		imageKey: 'image',
		source: EDelegateSource.POLKASSEMBLY,
		usernameKey: 'username'
	},
	w3f: {
		bioKey: 'shortDescription',
		source: EDelegateSource.W3F,
		usernameKey: 'name'
	}
} as const;

// Utility Functions
const createDelegateTransformer =
	(config: IDelegateSourceConfig) =>
	(data: IDelegateData[]): IDelegateSource[] =>
		data.map((item) => ({
			address: item.address,
			bio: item[config.bioKey] || '',
			dataSource: [config.source],
			image: config.imageKey ? item[config.imageKey] || '' : '',
			username: item[config.usernameKey] || ''
		}));

const mergeDelegates = (sources: IDelegateSource[]): IDelegateSource[] => {
	const delegatesMap = new Map<string, IDelegateSource>();
	sources.forEach((delegate) => {
		const existing = delegatesMap.get(delegate.address);
		if (existing) {
			delegatesMap.set(delegate.address, {
				...existing,
				bio: delegate.bio || existing.bio,
				dataSource: [...new Set([...existing.dataSource, ...delegate.dataSource])],
				image: delegate.image || existing.image,
				username: delegate.username || existing.username
			});
		} else {
			delegatesMap.set(delegate.address, delegate);
		}
	});
	return Array.from(delegatesMap.values());
};

// Data Fetching
const fetchDelegatesFromUrl = async (network: ENetwork, config: IDelegateSourceConfig): Promise<IDelegateSource[]> => {
	if (!config.url) return [];
	try {
		const response = await fetch(config.url(network), { next: { revalidate: 3600 } });
		if (!response.ok) throw new Error(`Failed to fetch ${config.source} delegates`);
		const data = (await response.json()) as IDelegateData[];
		return createDelegateTransformer(config)(data);
	} catch (error) {
		console.error(`Error fetching ${config.source} delegates:`, error);
		return [];
	}
};

const getW3FDelegates = (network: ENetwork): IDelegateSource[] => {
	const data = network === 'polkadot' ? w3fDelegatesPolkadot : w3fDelegatesKusama;
	return createDelegateTransformer(DELEGATE_SOURCES.w3f)(data);
};

const getPolkassemblyDelegates = async (network: ENetwork): Promise<IDelegateSource[]> => {
	const data = await OffChainDbService.GetAllDelegates(network);
	return createDelegateTransformer(DELEGATE_SOURCES.polkassembly)(
		data.map((delegate: IDelegate) => ({
			address: delegate.address,
			[DELEGATE_SOURCES.polkassembly.bioKey]: delegate.bio || '',
			[DELEGATE_SOURCES.polkassembly.usernameKey]: delegate.username || '',
			[DELEGATE_SOURCES.polkassembly.imageKey!]: delegate.image || ''
		}))
	);
};

const fetchAllDelegateSources = async (network: ENetwork): Promise<IDelegateSource[]> => {
	const [nova, parity, w3f, polkassembly] = await Promise.all([
		fetchDelegatesFromUrl(network, DELEGATE_SOURCES.nova),
		fetchDelegatesFromUrl(network, DELEGATE_SOURCES.parity),
		Promise.resolve(getW3FDelegates(network)),
		getPolkassemblyDelegates(network)
	]);
	return mergeDelegates([...nova, ...parity, ...w3f, ...polkassembly]);
};

// Analytics
const calculateDelegateStats = (address: string, delegationData: IDelegationData, votesCount: number): IDelegateStats => {
	const delegations = delegationData?.votingDelegations || [];
	let totalBalance = new BN(0);
	const uniqueDelegators = new Set<string>();

	delegations.forEach((delegation) => {
		try {
			// Safely handle balance calculations
			const balanceValue = new BN(delegation.balance);
			let adjustedBalance;

			if (delegation.lockPeriod) {
				adjustedBalance = balanceValue.mul(new BN(delegation.lockPeriod));
			} else {
				adjustedBalance = balanceValue.div(new BN('10'));
			}

			totalBalance = totalBalance.add(adjustedBalance);
			uniqueDelegators.add(delegation.from);
		} catch (error) {
			console.error(`Error calculating delegation balance for ${address}:`, error);
		}
	});

	return {
		address,
		delegatedBalance: totalBalance.toString(),
		receivedDelegationsCount: uniqueDelegators.size,
		votedProposalCount: votesCount
	};
};

const fetchDelegateAnalytics = async (network: ENetwork, addresses: string[]): Promise<IDelegateStats[]> => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	return Promise.all(
		addresses.map(async (address) => {
			try {
				const [delegationData, votesCount] = await Promise.all([
					OnChainDbService.GetAllTrackLevelAnalyticsDelegationData({ network, address }) as unknown as Promise<IDelegationData>,
					OnChainDbService.GetVotesCountForTimespan({ address, createdAtGte: thirtyDaysAgo, network })
				]);
				return calculateDelegateStats(address, delegationData, votesCount);
			} catch (error) {
				console.error(`Error fetching analytics for address ${address}:`, error);
				return { address, delegatedBalance: '0', receivedDelegationsCount: 0, votedProposalCount: 0 };
			}
		})
	);
};

// Filtering and Sorting
const filterAndSortDelegates = (delegates: (IDelegateSource & IDelegateStats)[], params: URLSearchParams) => {
	// Parse filter parameters safely
	let minVotingPower = null;
	let minVotedProposals = null;
	let minDelegations = null;
	const dataSource = params.get('dataSource')?.toLowerCase(); // Add dataSource parameter

	try {
		const minVotingPowerStr = params.get('minVotingPower');
		if (minVotingPowerStr && minVotingPowerStr !== 'null' && minVotingPowerStr !== 'undefined') {
			minVotingPower = new BN(minVotingPowerStr);
		}
	} catch (error) {
		console.error('Invalid minVotingPower parameter:', error);
	}

	try {
		const minVotedProposalsStr = params.get('minVotedProposals');
		if (minVotedProposalsStr && minVotedProposalsStr !== 'null' && minVotedProposalsStr !== 'undefined') {
			minVotedProposals = parseInt(minVotedProposalsStr, 10);
		}
	} catch (error) {
		console.error('Invalid minVotedProposals parameter:', error);
	}

	try {
		const minDelegationsStr = params.get('minDelegations');
		if (minDelegationsStr && minDelegationsStr !== 'null' && minDelegationsStr !== 'undefined') {
			minDelegations = parseInt(minDelegationsStr, 10);
		}
	} catch (error) {
		console.error('Invalid minDelegations parameter:', error);
	}

	// Get sort parameter
	const sortBy = params.get('sortBy') || 'votedProposalCount';

	// Filter the delegates
	let filtered = [...delegates]; // Create a copy to avoid mutation issues

	// Add data source filtering
	if (dataSource) {
		filtered = filtered.filter((delegate) => {
			const delegateDataSources = delegate.dataSource.map((source) => source.toLowerCase());
			return delegateDataSources.includes(dataSource);
		});
	}

	if (minVotingPower) {
		filtered = filtered.filter((delegate) => {
			try {
				const balance = new BN(delegate.delegatedBalance);
				return balance.gte(minVotingPower);
			} catch (error) {
				console.error(`Error comparing delegate balance for ${delegate.address}:`, error);
				return false;
			}
		});
	}

	if (minVotedProposals !== null) {
		filtered = filtered.filter((delegate) => delegate.votedProposalCount >= minVotedProposals);
	}

	if (minDelegations !== null) {
		filtered = filtered.filter((delegate) => delegate.receivedDelegationsCount >= minDelegations);
	}

	// Sort the filtered delegates
	return filtered.sort((a, b) => {
		switch (sortBy) {
			case 'votingPower': {
				try {
					const balanceA = new BN(a.delegatedBalance || '0');
					const balanceB = new BN(b.delegatedBalance || '0');
					return balanceB.cmp(balanceA);
				} catch (error) {
					console.error('Error sorting by votingPower:', error);
					return 0;
				}
			}

			case 'votedProposalCount': {
				const countA = Number(a.votedProposalCount || 0);
				const countB = Number(b.votedProposalCount || 0);
				return countB - countA;
			}

			case 'receivedDelegations': {
				const countA = Number(a.receivedDelegationsCount || 0);
				const countB = Number(b.receivedDelegationsCount || 0);
				return countB - countA;
			}

			case 'dataSource': {
				if (a.dataSource.length !== b.dataSource.length) {
					return b.dataSource.length - a.dataSource.length;
				}
				const sortedA = [...a.dataSource].sort().join(',');
				const sortedB = [...b.dataSource].sort().join(',');
				return sortedA.localeCompare(sortedB);
			}

			case 'address':
				return a.address.localeCompare(b.address);

			case 'username': {
				const usernameA = a.username || '';
				const usernameB = b.username || '';
				return usernameA.localeCompare(usernameB);
			}

			default: {
				const defaultCountA = Number(a.votedProposalCount || 0);
				const defaultCountB = Number(b.votedProposalCount || 0);
				return defaultCountB - defaultCountA;
			}
		}
	});
};
// API Handler
export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const network = await getNetworkFromHeaders();
		const { searchParams } = req.nextUrl;
		const address = searchParams.get('address');

		// Validate address if provided
		if (address) {
			const encodedAddress = getEncodedAddress(address, network);
			if (!encodedAddress && !isAddress(address)) {
				return NextResponse.json({ error: 'Invalid address provided' }, { status: 400 });
			}
		}

		// Fetch data
		const delegateSources = await fetchAllDelegateSources(network);
		if (!delegateSources.length) {
			return NextResponse.json({ error: 'No delegates found' }, { status: 404 });
		}

		const targetAddresses = address ? [address] : delegateSources.map((d) => d.address);
		const analytics = await fetchDelegateAnalytics(network, targetAddresses);

		// Combine data
		const combinedDelegates = delegateSources
			.map((delegate) => {
				const stats = analytics.find((a) => a.address === delegate.address);
				return {
					...delegate,
					delegatedBalance: stats?.delegatedBalance || '0',
					receivedDelegationsCount: stats?.receivedDelegationsCount || 0,
					votedProposalCount: stats?.votedProposalCount || 0
				};
			})
			.filter((d) => d.votedProposalCount > 0 || d.receivedDelegationsCount > 0);

		// Apply filters and sorting
		const filteredAndSorted = filterAndSortDelegates(combinedDelegates, searchParams);

		return NextResponse.json({
			delegates: filteredAndSorted,
			totalDelegates: filteredAndSorted.length
		});
	} catch (error) {
		console.error('Delegate API Error:', error);
		return error instanceof APIError
			? NextResponse.json({ error: error.message }, { status: error.status })
			: NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
