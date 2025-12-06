// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ENetwork, EProposalType, IDVDReferendumResponse } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
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

	const cachedData = await RedisService.GetDVCohortReferenda(network, String(cohortId));
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : DV_COHORTS_KUSAMA;
	const cohort = cohorts.find((c) => c.id === cohortId);

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Cohort not found');
	}

	if (!cohort.referendumIndexStart) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const referenda = await OnChainDbService.GetCohortReferenda({
		network,
		indexStart: cohort.referendumIndexStart,
		indexEnd: cohort.referendumIndexEnd || 1000000000
	});

	const postsDataPromises = referenda.map(async (ref: IDVDReferendumResponse) => {
		const offChainData = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: String(ref.index),
			proposalType: EProposalType.REFERENDUM_V2,
			proposer: ''
		});
		return { ref, offChainData };
	});

	const postsData = await Promise.all(postsDataPromises);

	const formattedReferenda = postsData.map(({ ref, offChainData }) => {
		return {
			index: ref.index,
			createdAtBlock: ref.createdAtBlock,
			trackNumber: ref.trackNumber,
			status: ref.status,
			tally: ref.tally
				? {
						ayes: ref.tally.ayes,
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
			preimage: {
				proposedCall: {
					description: offChainData?.title || ref.preimage?.proposedCall?.description
				}
			},
			proposalArguments: {
				description: offChainData?.title || ref.proposalArguments?.description
			}
		};
	});

	await RedisService.SetDVCohortReferenda(network, String(cohortId), JSON.stringify(formattedReferenda));

	return NextResponse.json(formattedReferenda);
});
