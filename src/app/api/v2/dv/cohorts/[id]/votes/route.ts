// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ENetwork, IDVVotes, IDVCohortVote } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { formatDVCohortVote } from '@/app/api/_api-utils/voteUtils';

const schema = z.object({
	id: z
		.string()
		.transform((val) => Number(val))
		.refine((val) => !isNaN(val), {
			message: 'Invalid cohort ID'
		})
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	const { id: cohortId } = schema.parse({ id });
	const network = await getNetworkFromHeaders();

	if (network !== ENetwork.POLKADOT && network !== ENetwork.KUSAMA) {
		throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_NETWORK);
	}

	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : DV_COHORTS_KUSAMA;
	const cohort = cohorts.find((c) => c.id === cohortId);

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Cohort not found');
	}

	if (!cohort.referendumIndexStart) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const voterAddresses = cohort.delegates.map((d) => d.address);

	const votes = await OnChainDbService.GetVotesForDelegateCohort({
		network,
		indexStart: cohort.referendumIndexStart,
		indexEnd: cohort.referendumIndexEnd || 1000000000,
		voterAddresses
	});

	const votesByReferendum: Record<number, IDVCohortVote[]> = {};

	votes.forEach((vote: IDVVotes) => {
		const refIndex = vote.proposal.index;
		if (!votesByReferendum[refIndex]) {
			votesByReferendum[refIndex] = [];
		}

		const voteData = formatDVCohortVote(vote);
		votesByReferendum[refIndex].push(voteData);
	});

	const result = Object.values(votesByReferendum).flat();

	return NextResponse.json(result);
});
