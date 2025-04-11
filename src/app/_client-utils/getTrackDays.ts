// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin } from '@shared/types';

interface TrackPeriodOutput {
	prepareDays?: number;
	decisionDays?: number;
	confirmDays?: number;
}

export function getTrackDays(trackName: EPostOrigin): TrackPeriodOutput {
	const network = getCurrentNetwork();

	const track = NETWORKS_DETAILS[network]?.trackDetails?.[trackName];
	const blockTime = NETWORKS_DETAILS[network]?.blockTime || 6000;

	if (!track) {
		return {};
	}

	const toDays = (blocks: number | undefined) => (blocks ? Math.round(((blocks * blockTime) / 1000 / 3600 / 24) * 100) / 100 : undefined);

	return {
		prepareDays: toDays(track.preparePeriod),
		decisionDays: toDays(track.decisionPeriod),
		confirmDays: toDays(track.confirmPeriod)
	};
}
