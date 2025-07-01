// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@shared/types';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

export const getTrackNameFromId = ({ trackId, network }: { trackId: number; network: ENetwork }): string | undefined => {
	const trackName = Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).find(([, details]) => details?.trackId === trackId)?.[1]?.name;
	return trackName?.replace(/_/g, ' ');
};
