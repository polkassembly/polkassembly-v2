// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ENetwork } from '@/_shared/types';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

const zodParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

	if (network !== ENetwork.POLKADOT && network !== ENetwork.KUSAMA) {
		throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_NETWORK);
	}

	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : network === ENetwork.KUSAMA ? DV_COHORTS_KUSAMA : [];

	const cohort = cohorts.find((c) => (c.id || c.index) === id);

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
	}

	const response = {
		index: Number(cohort.id || cohort.index),
		announcementLink: cohort.announcementLink,
		delegatesCount: cohort.delegatesCount,
		delegationPerDelegate: cohort.delegation,
		status: cohort.status,
		endIndexer: cohort.endIndexer,
		guardiansCount: cohort.guardiansCount,
		delegationPerGuardian: cohort.guardianDelegation,
		startIndexer: cohort.startIndexer,
		tracks: cohort.tracks,
		allReferendaCnt: cohort.allReferendaCnt,
		dvTrackReferendaCnt: cohort.dvTrackReferendaCnt,
		delegates: cohort.delegates.map((delegate) => ({
			cohortId: delegate.cohortId || cohort.index,
			address: delegate.address,
			endHeight: delegate.endHeight ?? delegate.endBlock,
			name: delegate.name,
			startHeight: delegate.startHeight ?? delegate.startBlock,
			w3f: delegate.w3f,
			role: delegate.role
		}))
	};

	return NextResponse.json(response);
});
