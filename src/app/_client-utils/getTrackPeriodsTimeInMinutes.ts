// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin } from '@shared/types';
import { BlockCalculationsService } from '../_client-services/block_calculations_service';

interface TrackPeriodOutput {
	prepareMinutes?: number;
	decisionMinutes?: number;
	confirmMinutes?: number;
}

export function getTrackPeriodsTimeInMinutes(trackName: EPostOrigin): TrackPeriodOutput {
	const network = getCurrentNetwork();

	const track = NETWORKS_DETAILS[`${network}`]?.trackDetails?.[`${trackName}`];

	if (!track) {
		return {};
	}

	const toMinutes = (blocks: number) => (blocks / BlockCalculationsService.getBlocksPerDay(network)) * 24 * 60;

	return {
		prepareMinutes: toMinutes(track.preparePeriod),
		decisionMinutes: toMinutes(track.decisionPeriod),
		confirmMinutes: toMinutes(track.confirmPeriod)
	};
}
