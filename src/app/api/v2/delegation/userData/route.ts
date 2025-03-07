// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, IDelegation } from '@/_shared/types';

export enum ETrackDelegationStatus {
	ALL = 'all',
	DELEGATED = 'delegated',
	RECEIVED_DELEGATION = 'received_delegation',
	UNDELEGATED = 'undelegated'
}

interface ITrackDelegation {
	track: number;
	active_proposals_count: number;
	status: ETrackDelegationStatus[];
	recieved_delegation_count: number;
	delegations: IDelegation[];
}

type TrackDelegationData = PromiseSettledResult<{
	votingDelegations: IDelegation[];
	proposalsConnection?: { totalCount: number };
}>;

function processTrackDelegation(trackDelegationData: TrackDelegationData, track: number, address: string, encodedAddress: string): ITrackDelegation | null {
	if (!trackDelegationData || trackDelegationData.status !== 'fulfilled' || !trackDelegationData.value) return null;

	const votingDelegationsArr = trackDelegationData.value.votingDelegations || [];

	const trackDelegation: ITrackDelegation = {
		active_proposals_count: trackDelegationData.value.proposalsConnection?.totalCount || 0,
		delegations: votingDelegationsArr,
		recieved_delegation_count: 0,
		status: [],
		track
	};

	if (!votingDelegationsArr.length) {
		trackDelegation.status.push(ETrackDelegationStatus.UNDELEGATED);
		return trackDelegation;
	}

	votingDelegationsArr.reduce((_, votingDelegation) => {
		if (trackDelegation.status.length >= 2) return _;

		if ([encodedAddress, address].includes(votingDelegation.from)) {
			if (!trackDelegation.status.includes(ETrackDelegationStatus.DELEGATED)) {
				trackDelegation.status.push(ETrackDelegationStatus.DELEGATED);
			}
		} else if (!trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
			trackDelegation.status.push(ETrackDelegationStatus.RECEIVED_DELEGATION);
		}
		return _;
	}, null);

	if (trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
		trackDelegation.recieved_delegation_count = votingDelegationsArr.filter((delegation) => ![encodedAddress, address].includes(delegation.from)).length;
	}

	return trackDelegation;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
	const { searchParams } = req.nextUrl;
	const address = searchParams.get('address');

	const substrateAddress = getSubstrateAddress(address || '');
	const network = await getNetworkFromHeaders();

	if (!substrateAddress) {
		return NextResponse.json({ error: 'Invalid address provided' }, { status: 400 });
	}

	const subsquidFetches = new Map<number, Promise<unknown>>();

	Object.values(NETWORKS_DETAILS[network as ENetwork].trackDetails).forEach((trackInfo) => {
		if (trackInfo.fellowshipOrigin) return;

		subsquidFetches.set(
			trackInfo.trackId,
			OnChainDbService.GetActiveDelegationsToOrFromAddressForTrack({
				address: substrateAddress,
				network,
				track: trackInfo.trackId
			})
		);
	});

	const subsquidResults = await Promise.allSettled([...subsquidFetches.values()]);
	const result: ITrackDelegation[] = [];

	[...subsquidFetches.keys()].forEach((trackId, index) => {
		const trackDelegation = processTrackDelegation(subsquidResults[index as number] as TrackDelegationData, trackId, address || '', substrateAddress);
		if (trackDelegation) {
			result.push(trackDelegation);
		}
	});

	return NextResponse.json(result);
}
