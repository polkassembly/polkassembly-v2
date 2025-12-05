// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ENetwork } from '@/_shared/types';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();

	if (network !== ENetwork.POLKADOT && network !== ENetwork.KUSAMA) {
		throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_NETWORK);
	}
	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : network === ENetwork.KUSAMA ? DV_COHORTS_KUSAMA : [];

	const response = cohorts.map((cohort) => ({
		index: Number(cohort.id || cohort.index),
		announcementLink: cohort.announcementLink,
		delegatesCount: cohort.delegatesCount,
		delegationPerDelegate: cohort.delegation,
		endIndexer: cohort.endIndexer,
		guardiansCount: cohort.guardiansCount,
		delegationPerGuardian: cohort.guardianDelegation,
		startIndexer: cohort.startIndexer,
		tracks: cohort.tracks,
		allReferendaCnt: cohort.allReferendaCnt,
		dvTrackReferendaCnt: cohort.dvTrackReferendaCnt,
		startTime: cohort.startIndexer?.blockTime ? new Date(cohort.startIndexer.blockTime) : undefined,
		endTime: cohort.endIndexer?.blockTime ? new Date(cohort.endIndexer.blockTime) : undefined,
		startBlock: cohort.startIndexer?.blockHeight,
		endBlock: cohort.endIndexer?.blockHeight,
		status: cohort.endIndexer ? 'Closed' : 'Ongoing',
		delegates: cohort.delegates
	}));

	return NextResponse.json(response);
});
