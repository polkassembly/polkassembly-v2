// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ENetwork, EProposalType, ICohortReferenda, IOffChainPost } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
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

	const cachedData = await RedisService.GetDVCohortReferenda(network, String(cohortId));
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const cohort = getCohortById(network, cohortId);

	if (cohort.startIndexer?.blockHeight === undefined || cohort.startIndexer?.blockHeight === null) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const referenda = await OnChainDbService.GetCohortReferenda({
		network
	});

	const cohortStartBlock = cohort.startIndexer.blockHeight;
	const cohortEndBlock = cohort.endIndexer?.blockHeight;

	const sortedReferenda = [...referenda].sort((a, b) => a.index - b.index);

	const firstActiveRef = findFirstActiveReferendum(sortedReferenda, cohortStartBlock);

	const startingIndex = firstActiveRef?.index ?? Infinity;

	const filteredReferenda = filterCohortReferenda(referenda, cohortStartBlock, cohortEndBlock, startingIndex);

	const postsDataPromises = filteredReferenda.map(async (ref: ICohortReferenda) => {
		const offChainData = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: String(ref.index),
			proposalType: EProposalType.REFERENDUM_V2,
			proposer: ''
		});
		return { ref, offChainData };
	});

	const postsDataResults = await Promise.allSettled(postsDataPromises);

	const postsData = postsDataResults
		.filter((result): result is PromiseFulfilledResult<{ ref: ICohortReferenda; offChainData: IOffChainPost }> => result.status === 'fulfilled')
		.map((result) => result.value);

	const formattedReferenda: ICohortReferenda[] = postsData.map(({ ref, offChainData }) => {
		const statusHistory = (ref.statusHistory || []).sort((a, b) => a.block - b.block);
		const lastStatusItem = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null;
		let computedStatus = ref.status;

		if (lastStatusItem) {
			computedStatus = lastStatusItem.status;
		}

		return {
			index: ref.index,
			createdAtBlock: ref.createdAtBlock,
			trackNumber: ref.trackNumber,
			status: computedStatus,
			tally: ref.tally
				? {
						ayes: ref.tally.ayes,
						bareAyes: ref.tally.bareAyes,
						nays: ref.tally.nays,
						support: ref.tally.support
					}
				: undefined,
			decisionDeposit: ref.decisionDeposit
				? {
						amount: ref.decisionDeposit.amount,
						who: ref.decisionDeposit.who
					}
				: undefined,
			submissionDeposit: ref.submissionDeposit
				? {
						amount: ref.submissionDeposit.amount,
						who: ref.submissionDeposit.who
					}
				: undefined,
			preimage:
				ref.preimage?.proposedCall?.description || offChainData?.title
					? {
							proposedCall: {
								description: offChainData?.title || ref.preimage?.proposedCall?.description || '',
								args: ref.preimage?.proposedCall?.args || {},
								method: ref.preimage?.proposedCall?.method || '',
								section: ref.preimage?.proposedCall?.section || ''
							}
						}
					: undefined,
			proposalArguments:
				ref.preimage?.proposedCall?.description || offChainData?.title
					? {
							description: offChainData?.title || ref.preimage?.proposedCall?.description || '',
							args: ref.proposalArguments?.args || {},
							method: ref.proposalArguments?.method || '',
							section: ref.proposalArguments?.section || ''
						}
					: undefined,
			hash: ref.hash,
			statusHistory: ref.statusHistory
		};
	});

	await RedisService.SetDVCohortReferenda(network, String(cohortId), JSON.stringify(formattedReferenda));

	return NextResponse.json(formattedReferenda);
});
