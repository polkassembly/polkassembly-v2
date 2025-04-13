// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin } from '@shared/types';
import { getBlocksPerDay } from './getBlocksPerDay';

interface TrackPeriodOutput {
	prepareDays?: number;
	decisionDays?: number;
	confirmDays?: number;
	enactmentDays?: number;
}

export function getTrackDays(trackName: EPostOrigin): TrackPeriodOutput {
	const network = getCurrentNetwork();

	const track = NETWORKS_DETAILS[`${network}`]?.trackDetails?.[`${trackName}`];

	if (!track) {
		return {};
	}

	const toDays = (blocks: number) => blocks / getBlocksPerDay(network);

	return {
		prepareDays: toDays(track.preparePeriod),
		decisionDays: toDays(track.decisionPeriod),
		confirmDays: toDays(track.confirmPeriod),
		enactmentDays: toDays(track.minEnactmentPeriod)
	};
}
