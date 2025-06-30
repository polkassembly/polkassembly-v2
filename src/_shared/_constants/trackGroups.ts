// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin } from '@shared/types';
import { NETWORKS_DETAILS } from './networks';

export type TrackGroup = 'Main' | 'Treasury' | 'Whitelist' | 'Governance' | 'Origin';

/**
 * Dynamically generates track groups based on network track details and track purposes
 * @param network - The network to get track groups for
 * @returns Object with track groups and their associated track IDs
 */
export function getTrackGroups(network: ENetwork): Record<TrackGroup, number[]> {
	const trackDetails = NETWORKS_DETAILS[network]?.trackDetails;

	if (!trackDetails) {
		return {
			Main: [],
			Treasury: [],
			Whitelist: [],
			Governance: [],
			Origin: []
		};
	}

	const groups: Record<TrackGroup, number[]> = {
		Main: [],
		Treasury: [],
		Whitelist: [],
		Governance: [],
		Origin: []
	};

	// Group tracks by their actual purpose and functionality
	Object.values(trackDetails).forEach((track) => {
		if (track && typeof track.trackId === 'number') {
			const { trackId } = track;
			const trackName = track.name;
			const groupFromConstants = track.group;

			// Whitelist tracks - tracks for whitelisting and fellowship administration
			if (trackName === trackDetails[EPostOrigin.WHITELISTED_CALLER]?.name || trackName === trackDetails[EPostOrigin.FELLOWSHIP_ADMIN]?.name) {
				groups.Whitelist.push(trackId);
			}
			// Governance tracks - tracks for referendum management and governance operations
			else if (trackName === trackDetails[EPostOrigin.REFERENDUM_CANCELLER]?.name || trackName === trackDetails[EPostOrigin.REFERENDUM_KILLER]?.name) {
				groups.Governance.push(trackId);
			}
			// Main tracks - administrative and operational tracks
			else if (
				trackName === trackDetails[EPostOrigin.STAKING_ADMIN]?.name ||
				trackName === trackDetails[EPostOrigin.ROOT]?.name ||
				trackName === trackDetails[EPostOrigin.WISH_FOR_CHANGE]?.name ||
				trackName === trackDetails[EPostOrigin.AUCTION_ADMIN]?.name
			) {
				groups.Main.push(trackId);
			}
			// Governance tracks - tracks for governance operations
			else if (trackName === trackDetails[EPostOrigin.LEASE_ADMIN]?.name || trackName === trackDetails[EPostOrigin.GENERAL_ADMIN]?.name) {
				groups.Governance.push(trackId);
			}
			// Fallback: use the group from network constants if it matches our types
			else if (groupFromConstants && groups[groupFromConstants as TrackGroup]) {
				groups[groupFromConstants as TrackGroup].push(trackId);
			}
		}
	});

	// Sort track IDs within each group for consistency
	Object.keys(groups).forEach((key) => {
		groups[key as TrackGroup].sort((a, b) => a - b);
	});

	return groups;
}

/**
 * Legacy constant for backward compatibility - uses Polkadot as default
 * @deprecated Use getTrackGroups(network) instead
 */
export const TRACK_GROUPS = getTrackGroups(ENetwork.POLKADOT);
