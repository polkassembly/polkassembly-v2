// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NOVA_DELEGATES, PARITY_DELEGATES, W3F_DELEGATES } from '@/_shared/_constants/delegates';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { EDelegateSource, ENetwork, IDelegate, IDelegateDetails } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { encodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { NextResponse } from 'next/server';

interface INovaDelegate {
	address: string;
	name?: string;
	image?: string;
	shortDescription?: string;
	longDescription?: string;
	isOrganization?: boolean;
}

interface IParityDelegate {
	name?: string;
	address: string;
	manifesto?: string;
}

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();

	const cachedDelegateDetails = await RedisService.GetDelegateDetails(network);
	if (cachedDelegateDetails) {
		return NextResponse.json(cachedDelegateDetails);
	}

	await cryptoWaitReady();

	const delegatesWithSource: Record<string, IDelegate> = {};

	W3F_DELEGATES.forEach((delegate) => {
		if (delegate.network === network) {
			delegatesWithSource[delegate.address] = {
				...delegate
			};
		}
	});

	const novaDelegatesUrl = NOVA_DELEGATES[network as ENetwork];
	const novaDelegatesResponse = novaDelegatesUrl ? ((await (await fetch(novaDelegatesUrl)).json()) as INovaDelegate[]) : [];
	novaDelegatesResponse.forEach((novaDelegate) => {
		delegatesWithSource[novaDelegate.address] = {
			address: novaDelegate.address,
			image: novaDelegate.image,
			manifesto: novaDelegate.longDescription,
			name: novaDelegate.name,
			source: EDelegateSource.NOVA,
			network
		};
	});

	const parityDelegatesUrl = PARITY_DELEGATES[network as ENetwork];
	const parityDelegatesResponse = parityDelegatesUrl ? ((await (await fetch(parityDelegatesUrl)).json()) as IParityDelegate[]) : [];
	parityDelegatesResponse.forEach((parityDelegate) => {
		delegatesWithSource[parityDelegate.address] = {
			address: parityDelegate.address,
			manifesto: parityDelegate.manifesto,
			name: parityDelegate.name,
			source: EDelegateSource.PARITY,
			network
		};
	});

	const polkassemblyDelegates = await OffChainDbService.GetPolkassemblyDelegates(network);
	polkassemblyDelegates.forEach((polkassemblyDelegate) => {
		delegatesWithSource[encodeAddress(polkassemblyDelegate.address, NETWORKS_DETAILS[network as ENetwork].ss58Format)] = {
			...polkassemblyDelegate,
			source: EDelegateSource.POLKASSEMBLY
		};
	});

	const allDelegatesWithVotingPowerAndDelegationsCount = await OnChainDbService.GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(network);

	const allDelegateDetailPromises = Object.entries(allDelegatesWithVotingPowerAndDelegationsCount).map(async ([address, { receivedDelegationsCount, votingPower }]) => {
		const last30DaysConvictionVoteCount = await OnChainDbService.GetLast30DaysConvictionVoteCountByAddress({ network, address });
		const publicUser = await OffChainDbService.GetPublicUserByAddress(address);

		const delegateDetails: IDelegateDetails = {
			address,
			source: delegatesWithSource[String(address)]?.source ?? EDelegateSource.INDIVIDUAL,
			createdAt: delegatesWithSource[String(address)]?.createdAt,
			updatedAt: delegatesWithSource[String(address)]?.updatedAt,
			image: delegatesWithSource[String(address)]?.image,
			manifesto: delegatesWithSource[String(address)]?.manifesto,
			name: delegatesWithSource[String(address)]?.name,
			network,
			receivedDelegationsCount,
			votingPower,
			last30DaysVotedProposalsCount: last30DaysConvictionVoteCount,
			publicUser: publicUser ?? undefined
		};

		return delegateDetails;
	});

	const delegateDetails: IDelegateDetails[] = await Promise.all(allDelegateDetailPromises);

	await RedisService.SetDelegateDetails(network, delegateDetails);

	return NextResponse.json(delegateDetails);
});
