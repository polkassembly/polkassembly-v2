// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ENetwork, IDVVotes, IDVCohortVote, EProposalStatus, IDVDReferendumResponse } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { formatDVCohortVote } from '@/_shared/_utils/dvDelegateUtils';
import { RedisService } from '@/app/api/_api-services/redis_service';

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

	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : DV_COHORTS_KUSAMA;
	const cohort = cohorts.find((c) => c.id === cohortId);

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Cohort not found');
	}

	if (cohort.startIndexer?.blockHeight === undefined || cohort.startIndexer?.blockHeight === null) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const voterAddresses = cohort.delegates.map((d) => d.address);

	const referenda = await OnChainDbService.GetCohortReferenda({
		network
	});

	const cohortStartBlock = cohort.startIndexer.blockHeight;
	const cohortEndBlock = cohort.endIndexer?.blockHeight;
	const isOngoingCohort = !cohortEndBlock;

	const sortedReferenda = [...referenda].sort((a, b) => a.index - b.index);

	const firstActiveRef = sortedReferenda.find((ref: IDVDReferendumResponse) => {
		const sortedHistory = (ref.statusHistory || []).sort((a, b) => a.block - b.block);
		return sortedHistory.some((s) => s.block >= cohortStartBlock);
	});

	const startingIndex = firstActiveRef?.index ?? Infinity;

	const filteredReferenda = referenda
		.filter((ref: IDVDReferendumResponse) => {
			if (ref.index < startingIndex) return false;

			const sortedHistory = (ref.statusHistory || []).sort((a, b) => a.block - b.block);

			const finalStatusEvent = sortedHistory.find((h) =>
				[
					EProposalStatus.Executed,
					EProposalStatus.Rejected,
					EProposalStatus.Confirmed,
					EProposalStatus.TimedOut,
					EProposalStatus.Killed,
					EProposalStatus.Cancelled,
					EProposalStatus.Approved
				].includes(h.status as EProposalStatus)
			);

			if (isOngoingCohort) {
				if (!finalStatusEvent) return true;
				const isRelayChainBlock = finalStatusEvent.block > 20000000;
				return !(isRelayChainBlock && finalStatusEvent.block < cohortStartBlock);
			}

			if (!finalStatusEvent) return false;

			return finalStatusEvent.block >= cohortStartBlock && finalStatusEvent.block <= cohortEndBlock;
		})
		.sort((a: IDVDReferendumResponse, b: IDVDReferendumResponse) => b.index - a.index);

	const indices = filteredReferenda.map((r: IDVDReferendumResponse) => r.index);

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
