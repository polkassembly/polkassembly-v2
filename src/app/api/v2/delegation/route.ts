// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { BN } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import { EDelegateSource, ENetwork, IDelegate, IDelegateData, IDelegateStats, IDelegationData } from '@/_shared/types';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../_api-utils/apiError';
import { OnChainDbService } from '../../_api-services/onchain_db_service';
import { OffChainDbService } from '../../_api-services/offchain_db_service';
import { w3fDelegatesKusama, w3fDelegatesPolkadot } from '../../_api-constants/delegateData';

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

const verifyDelegateSource = (address: string, knownSources: Map<string, EDelegateSource[]>): EDelegateSource[] => {
	return knownSources.get(address) || [EDelegateSource.NA];
};

const calculateDelegateStats = (
	address: string,
	delegationData: IDelegationData,
	votesCount: number,
	knownSources: Map<string, EDelegateSource[]>
): IDelegateStats & { sources: EDelegateSource[] } => {
	const delegations = delegationData?.votingDelegations || [];
	let totalBalance = new BN(0);
	const uniqueDelegators = new Set<string>();

	delegations.forEach((delegation) => {
		try {
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
		sources: verifyDelegateSource(address, knownSources),
		votedProposalCount: votesCount
	};
};

const fetchDelegateAnalytics = async (
	network: ENetwork,
	addresses: string[],
	knownSources?: Map<string, EDelegateSource[]>
): Promise<(IDelegateStats & { sources: EDelegateSource[] })[]> => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const sourcesMap = knownSources || new Map();

	return Promise.all(
		addresses.map(async (address) => {
			try {
				const [delegationData, votesCount] = await Promise.all([
					OnChainDbService.GetAllTrackLevelAnalyticsDelegationData({ network, address }) as unknown as Promise<IDelegationData>,
					OnChainDbService.GetVotesCountForTimespan({ address, createdAtGte: thirtyDaysAgo, network })
				]);
				return calculateDelegateStats(address, delegationData, votesCount, sourcesMap);
			} catch (error) {
				console.error(`Error fetching analytics for address ${address}:`, error);
				return {
					address,
					delegatedBalance: '0',
					receivedDelegationsCount: 0,
					sources: [EDelegateSource.NA],
					votedProposalCount: 0
				};
			}
		})
	);
};
const fetchAllDelegateAnalytics = async (network: ENetwork): Promise<IDelegationData> => {
	return (await OnChainDbService.GetAllTrackLevelAnalyticsDelegationData({ network, address: '' })) as unknown as IDelegationData;
};
const fetchAllDelegateSources = async (network: ENetwork): Promise<IDelegateSource[]> => {
	const [nova, parity, w3f, polkassembly] = await Promise.all([
		fetchDelegatesFromUrl(network, DELEGATE_SOURCES.nova),
		fetchDelegatesFromUrl(network, DELEGATE_SOURCES.parity),
		Promise.resolve(getW3FDelegates(network)),
		getPolkassemblyDelegates(network)
	]);

	const knownDelegatesMap = new Map<string, EDelegateSource[]>();
	const addToKnownDelegates = (delegate: IDelegateSource, source: EDelegateSource) => {
		const existing = knownDelegatesMap.get(delegate.address) || [];
		knownDelegatesMap.set(delegate.address, [...new Set([...existing, source])]);
	};

	nova.forEach((delegate) => addToKnownDelegates(delegate, EDelegateSource.NOVA));
	parity.forEach((delegate) => addToKnownDelegates(delegate, EDelegateSource.PARITY));
	w3f.forEach((delegate) => addToKnownDelegates(delegate, EDelegateSource.W3F));
	polkassembly.forEach((delegate) => addToKnownDelegates(delegate, EDelegateSource.POLKASSEMBLY));
	const allDelegateData = await fetchAllDelegateAnalytics(network);
	const activeDelegateAddresses = new Set<string>();
	allDelegateData.votingDelegations.forEach((delegation) => {
		activeDelegateAddresses.add(delegation.to);
		activeDelegateAddresses.add(delegation.from);
	});

	const naDelegates: IDelegateSource[] = Array.from(activeDelegateAddresses)
		.filter((address) => !knownDelegatesMap.has(address))
		.map((address) => ({
			address,
			bio: '',
			dataSource: [EDelegateSource.NA],
			image: '',
			username: ''
		}));

	const analytics = await fetchDelegateAnalytics(network, Array.from(activeDelegateAddresses));
	const allDelegates = [...nova, ...parity, ...w3f, ...polkassembly, ...naDelegates].map((delegate) => {
		const stats = analytics.find((stat) => stat.address === delegate.address);
		return {
			...delegate,
			delegatedBalance: stats?.delegatedBalance || '0',
			receivedDelegationsCount: stats?.receivedDelegationsCount || 0,
			votedProposalCount: stats?.votedProposalCount || 0
		};
	});

	return mergeDelegates(allDelegates);
};

export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const network = await getNetworkFromHeaders();
		const { searchParams } = req.nextUrl;
		const address = searchParams.get('address');

		if (address) {
			const encodedAddress = getEncodedAddress(address, network);
			if (!encodedAddress && !isAddress(address)) {
				return NextResponse.json({ error: 'Invalid address provided' }, { status: 400 });
			}
		}
		const delegateSources = await fetchAllDelegateSources(network);
		if (!delegateSources.length) {
			return NextResponse.json({ error: 'No delegates found' }, { status: 404 });
		}
		const targetAddresses = address ? [address] : delegateSources.map((d) => d.address);
		const analytics = await fetchDelegateAnalytics(network, targetAddresses);

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

		return NextResponse.json({
			delegates: combinedDelegates,
			totalDelegates: combinedDelegates.length
		});
	} catch (error) {
		console.error('Delegate API Error:', error);
		return error instanceof APIError
			? NextResponse.json({ error: error.message }, { status: error.status })
			: NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
