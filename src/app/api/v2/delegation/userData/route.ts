// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, ETrackDelegationStatus } from '@/_shared/types';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

interface IDelegation {
	track: number;
	to: string;
	from: string;
	lockPeriod: number;
	balance: string;
	createdAt: Date;
}

interface ITrackDelegation {
	track: number;
	active_proposals_count: number;
	status: ETrackDelegationStatus[];
	recieved_delegation_count: number;
	delegations: IDelegation[];
}

const QuerySchema = z.object({
	address: z.string().min(1, 'Address is required')
});

interface TrackDelegationData {
	votingDelegations: IDelegation[];
	proposalsConnection?: { totalCount: number };
}

function processTrackDelegation(data: PromiseSettledResult<TrackDelegationData>, track: number, address: string, encodedAddress: string): ITrackDelegation | null {
	if (!data || data.status !== 'fulfilled' || !data.value) {
		return null;
	}

	const { votingDelegations = [], proposalsConnection } = data.value;

	const trackDelegation: ITrackDelegation = {
		active_proposals_count: proposalsConnection?.totalCount || 0,
		delegations: votingDelegations,
		recieved_delegation_count: 0,
		status: [],
		track
	};

	if (votingDelegations.length === 0) {
		trackDelegation.status.push(ETrackDelegationStatus.UNDELEGATED);
		return trackDelegation;
	}

	const addresses = [encodedAddress, address];
	votingDelegations.forEach((delegation) => {
		if (trackDelegation.status.length >= 2) return;

		if (addresses.includes(delegation.from)) {
			if (!trackDelegation.status.includes(ETrackDelegationStatus.DELEGATED)) {
				trackDelegation.status.push(ETrackDelegationStatus.DELEGATED);
			}
		} else if (!trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
			trackDelegation.status.push(ETrackDelegationStatus.RECEIVED_DELEGATION);
		}
	});

	if (trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
		trackDelegation.recieved_delegation_count = votingDelegations.filter((delegation) => !addresses.includes(delegation.from)).length;
	}
	return trackDelegation;
}

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	try {
		const network = await getNetworkFromHeaders();

		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
		}

		const { searchParams } = req.nextUrl;
		const { address } = QuerySchema.parse({
			address: searchParams.get('address')
		});

		const substrateAddress = getSubstrateAddress(address);

		if (!substrateAddress) {
			throw new APIError(ERROR_CODES.ADDRESS_NOT_FOUND_ERROR, StatusCodes.BAD_REQUEST);
		}
		const trackFetches = new Map<number, Promise<TrackDelegationData>>();
		Object.values(NETWORKS_DETAILS[network as ENetwork].trackDetails)
			.filter((track) => !track.fellowshipOrigin)
			.forEach((track) => {
				trackFetches.set(
					track.trackId,
					OnChainDbService.GetActiveDelegationsToOrFromAddressForTrack({
						address: substrateAddress,
						network,
						track: track.trackId
					}) as unknown as Promise<TrackDelegationData>
				);
			});

		if (trackFetches.size === 0) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
		}

		const trackResults = await Promise.allSettled([...trackFetches.values()]);

		const delegations: ITrackDelegation[] = [...trackFetches.keys()]
			.map((trackId, index) => processTrackDelegation(trackResults[index as number], trackId, address, substrateAddress))
			.filter((delegation): delegation is ITrackDelegation => delegation !== null);

		if (delegations.length === 0) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
		}

		return NextResponse.json(delegations);
	} catch (error) {
		console.error('User Delegation Data Error:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid request parameters' }, { status: StatusCodes.BAD_REQUEST });
		}

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Failed to fetch user delegation data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
});
