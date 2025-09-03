// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin } from '@shared/types';
import { NETWORKS_DETAILS } from './networks';

export type TrackGroup = 'Main' | 'Treasury' | 'Whitelist' | 'Governance' | 'Origin';

// Pre-define the default groups to avoid recreating objects
const DEFAULT_GROUPS: Record<TrackGroup, number[]> = {
	Main: [],
	Treasury: [],
	Whitelist: [],
	Governance: [],
	Origin: []
};

/**
 * Dynamically generates track groups based on network track details and track purposes
 * @param network - The network to get track groups for
 * @returns Object with track groups and their associated track IDs
 */
export function getTrackGroups(network: ENetwork): Record<TrackGroup, number[]> {
	const trackDetails = NETWORKS_DETAILS[network]?.trackDetails;

	if (!trackDetails) {
		return { ...DEFAULT_GROUPS };
	}

	// Create groups object with empty arrays
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

			// Use switch statement for better performance and cleaner code
			switch (trackName) {
				case trackDetails[EPostOrigin.WHITELISTED_CALLER]?.name:
				case trackDetails[EPostOrigin.FELLOWSHIP_ADMIN]?.name:
					groups.Whitelist.push(trackId);
					break;
				case trackDetails[EPostOrigin.REFERENDUM_CANCELLER]?.name:
				case trackDetails[EPostOrigin.REFERENDUM_KILLER]?.name:
					groups.Governance.push(trackId);
					break;
				case trackDetails[EPostOrigin.STAKING_ADMIN]?.name:
				case trackDetails[EPostOrigin.ROOT]?.name:
				case trackDetails[EPostOrigin.WISH_FOR_CHANGE]?.name:
				case trackDetails[EPostOrigin.AUCTION_ADMIN]?.name:
					groups.Main.push(trackId);
					break;
				case trackDetails[EPostOrigin.LEASE_ADMIN]?.name:
				case trackDetails[EPostOrigin.GENERAL_ADMIN]?.name:
					groups.Governance.push(trackId);
					break;
				default:
					// Fallback: use the group from network constants if it matches our types
					if (groupFromConstants && groups[groupFromConstants as TrackGroup]) {
						groups[groupFromConstants as TrackGroup].push(trackId);
					}
					break;
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
