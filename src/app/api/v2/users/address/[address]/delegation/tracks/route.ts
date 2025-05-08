// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EDelegationStatus, ENetwork, ITrackDelegationStats } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

const zodParamsSchema = z.object({
	address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
});

// get delegation status and active proposals for all tracks
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
	const [{ address }, network] = await Promise.all([zodParamsSchema.parse(await params), getNetworkFromHeaders()]);

	const { trackDetails } = NETWORKS_DETAILS[network as ENetwork];
	const allTrackIds = Object.values(trackDetails).map((track) => track.trackId);

	const [allVoteDelegations, activeProposalsCountByTrackIds] = await Promise.all([
		OnChainDbService.GetConvictionVoteDelegationsToAndFromAddress({ network, address }),
		OnChainDbService.GetActiveProposalsCountByTrackIds({ network, trackIds: allTrackIds })
	]);

	const encodedAddress = getEncodedAddress(address, network);

	if (!encodedAddress) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Address is not a valid web-3 address');
	}

	// for each track, get the delegation status and active proposals
	const delegationStats = Object.values(trackDetails).map((track) => {
		const trackDelegationStats: ITrackDelegationStats = {
			trackId: track.trackId,
			status: EDelegationStatus.UNDELEGATED,
			activeProposalsCount: activeProposalsCountByTrackIds[track.trackId],
			delegations: []
		};

		// Check delegations for the current track
		const trackDelegations = allVoteDelegations.filter((delegation) => delegation.track === track.trackId);

		if (trackDelegations.length > 0) {
			const delegation = trackDelegations.filter((d) => d.from === encodedAddress || d.to === encodedAddress);
			if (delegation?.length > 0) {
				delegation.forEach((d) => {
					trackDelegationStats.status = d.from === encodedAddress ? EDelegationStatus.DELEGATED : EDelegationStatus.RECEIVED;
				});
				trackDelegationStats.delegations = delegation?.map((d) => ({
					address: d.from,
					balance: d.balance,
					createdAt: d.createdAt,
					lockPeriod: d.lockPeriod,
					endsAt: new Date() // update later
				}));
			}
		}

		return trackDelegationStats;
	});

	return NextResponse.json({ delegationStats });
});
