// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '@/_shared/_constants/dvCohorts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ENetwork, ICohortReferenda, IDVCohort } from '@/_shared/types';
import { CLOSED_PROPOSAL_STATUSES } from '@/_shared/_constants/closedProposalStatuses';
import { APIError } from './apiError';

const RELAY_CHAIN_BLOCK_THRESHOLD = 20000000;

export function getCohortById(network: ENetwork, cohortId: number): IDVCohort {
	const cohorts = network === ENetwork.POLKADOT ? DV_COHORTS_POLKADOT : DV_COHORTS_KUSAMA;
	const cohort = cohorts.find((c) => c.id === cohortId);

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
	}

	return cohort;
}

export function filterCohortReferenda(referenda: ICohortReferenda[], cohortStartBlock: number, cohortEndBlock: number | undefined, startingIndex: number): ICohortReferenda[] {
	const isOngoingCohort = !cohortEndBlock;

	return referenda
		.filter((ref: ICohortReferenda) => {
			if (ref.index < startingIndex) return false;

			const sortedHistory = (ref.statusHistory || []).sort((a, b) => a.block - b.block);

			const finalStatusEvent = sortedHistory.find((h) => CLOSED_PROPOSAL_STATUSES.includes(h.status));

			if (isOngoingCohort) {
				if (!finalStatusEvent) return true;
				const isRelayChainBlock = finalStatusEvent.block > RELAY_CHAIN_BLOCK_THRESHOLD;
				return !(isRelayChainBlock && finalStatusEvent.block < cohortStartBlock);
			}

			if (!finalStatusEvent) return false;

			return finalStatusEvent.block >= cohortStartBlock && finalStatusEvent.block <= cohortEndBlock;
		})
		.sort((a: ICohortReferenda, b: ICohortReferenda) => b.index - a.index);
}

export function findFirstActiveReferendum(referenda: ICohortReferenda[], cohortStartBlock: number): ICohortReferenda | undefined {
	return referenda.find((ref: ICohortReferenda) => {
		const sortedHistory = (ref.statusHistory || []).sort((a, b) => a.block - b.block);
		return sortedHistory.some((s) => s.block >= cohortStartBlock);
	});
}
