// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '../_constants/dvCohorts';
import { ECohortStatus, ENetwork, IDVCohort } from '../types';

export function getDVCohortsByNetwork(network: ENetwork): IDVCohort[] {
	if (network === ENetwork.KUSAMA) return DV_COHORTS_KUSAMA;
	if (network === ENetwork.POLKADOT) return DV_COHORTS_POLKADOT;
	return [];
}

export function getCurrentDVCohort(network: ENetwork): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.status === ECohortStatus.ONGOING) || null;
}

export function getDVCohortByIndex(network: ENetwork, index: number): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.index === index) || null;
}
