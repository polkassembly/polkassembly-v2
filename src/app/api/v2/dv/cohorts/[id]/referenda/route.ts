// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { SubsquidService } from '@/app/api/_api-services/onchain_db_service/subsquid_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ENetwork, EProposalStatus, EProposalType, IDVDReferendumResponse } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

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

	const referenda = await SubsquidService.GetCohortReferenda({
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
		const trackInfo = Object.values(NETWORKS_DETAILS[network as ENetwork]?.trackDetails || {}).find((t) => t.trackId === ref.trackNumber);

		return {
			referendumIndex: ref.index,
			indexer: {
				blockHeight: ref.createdAtBlock
			},
			track: ref.trackNumber,
			state: {
				name: ref.status,
				args: {
					result: {
						ok: null
					}
				}
			},
			tally: ref.tally
				? {
						ayes: ref.tally.ayes,
						nays: ref.tally.nays,
						support: ref.tally.support
					}
				: null,
			isFinal: [EProposalStatus.Executed, EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled, EProposalStatus.Killed, EProposalStatus.Approved].includes(
				ref.status as EProposalStatus
			),
			approved: ref.decisionDeposit
				? [
						ref.statusHistory?.find((s: { status: string; block: number }) => s.status === 'Confirmed')?.block ||
							ref.statusHistory?.find((s: { status: string; block: number }) => s.status === 'Executed')?.block ||
							0,
						ref.submissionDeposit
							? {
									who: ref.submissionDeposit.who,
									amount: ref.submissionDeposit.amount
								}
							: null,
						{
							who: ref.decisionDeposit.who,
							amount: ref.decisionDeposit.amount
						}
					].filter(Boolean)
				: [],
			trackInfo: trackInfo
				? {
						id: trackInfo.trackId,
						name: trackInfo.name,
						maxDeciding: trackInfo.maxDeciding,
						decisionDeposit: trackInfo.decisionDeposit.toString(),
						preparePeriod: trackInfo.preparePeriod,
						decisionPeriod: trackInfo.decisionPeriod,
						confirmPeriod: trackInfo.confirmPeriod,
						minEnactmentPeriod: trackInfo.minEnactmentPeriod,
						minApproval: trackInfo.minApproval,
						minSupport: trackInfo.minSupport
					}
				: null,
			title: offChainData?.title
		};
	});

	return NextResponse.json(formattedReferenda);
});
