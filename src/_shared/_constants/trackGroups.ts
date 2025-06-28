// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@shared/types';
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

			// Treasury tracks - tracks that involve spending from treasury
			if (track.maxSpend || trackName.includes('spender') || trackName.includes('tipper') || trackName === 'treasurer') {
				groups.Treasury.push(trackId);
			}
			// Whitelist tracks - tracks for whitelisting and fellowship administration
			else if (trackName === 'whitelisted_caller' || trackName === 'fellowship_admin') {
				groups.Whitelist.push(trackId);
			}
			// Governance tracks - tracks for referendum management and governance operations
			else if (trackName === 'referendum_canceller' || trackName === 'referendum_killer') {
				groups.Governance.push(trackId);
			}
			// Main tracks - administrative and operational tracks
			else if (trackName === 'staking_admin' || trackName === 'root' || trackName === 'wish_for_change' || trackName === 'auction_admin') {
				groups.Main.push(trackId);
			}
			// Governance tracks - tracks for governance operations
			else if (trackName === 'lease_admin' || trackName === 'general_admin') {
				groups.Governance.push(trackId);
			}
			// Fallback: use the group from network constants if it matches our types
			else if (groupFromConstants && groups[groupFromConstants as TrackGroup]) {
				groups[groupFromConstants as TrackGroup].push(trackId);
			}
			// Final fallback: classify unknown tracks based on common patterns
			else if (trackName.includes('treasury') || trackName.includes('spend')) {
				groups.Treasury.push(trackId);
			} else if (trackName.includes('admin')) {
				groups.Main.push(trackId);
			} else if (trackName.includes('governance') || trackName.includes('referendum')) {
				groups.Governance.push(trackId);
			} else {
				// Default to Origin for unclassified tracks
				groups.Origin.push(trackId);
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
