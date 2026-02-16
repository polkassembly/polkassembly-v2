// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ENetwork, IDVVotes, IDVCohortVote, ICohortReferenda } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { formatDVCohortVote } from '@/_shared/_utils/dvDelegateUtils';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getCohortById, filterCohortReferenda, findFirstActiveReferendum } from '@/app/api/_api-utils/dvApiUtils';

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

	const cachedData = await RedisService.GetDVCohortVotes(network, String(cohortId));
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const cohort = getCohortById(network, cohortId);

	if (cohort.startIndexer?.blockHeight === undefined || cohort.startIndexer?.blockHeight === null) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const voterAddresses = cohort.delegates.map((d) => d.address);

	const referenda = await OnChainDbService.GetCohortReferenda({
		network
	});

	const cohortStartBlock = cohort.startIndexer.blockHeight;
	const cohortEndBlock = cohort.endIndexer?.blockHeight;

	const sortedReferenda = [...referenda].sort((a, b) => a.index - b.index);

	const firstActiveRef = findFirstActiveReferendum(sortedReferenda, cohortStartBlock);

	const startingIndex = firstActiveRef?.index ?? Infinity;

	const filteredReferenda = filterCohortReferenda(referenda, cohortStartBlock, cohortEndBlock, startingIndex);

	const indices = filteredReferenda.map((r: ICohortReferenda) => r.index);

	const votes = await OnChainDbService.GetVotesForReferendaIndices({
		network,
		indices,
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

	await RedisService.SetDVCohortVotes(network, String(cohortId), JSON.stringify(result));

	return NextResponse.json(result);
});
