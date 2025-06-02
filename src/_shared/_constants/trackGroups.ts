// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const TRACK_GROUPS = {
	Main: [0, 2, 10, 15],
	Treasury: [34, 33, 32, 31, 30, 11],
	Whitelist: [1, 13],
	Governance: [12, 14, 20, 21]
} as const;

export type TrackGroup = keyof typeof TRACK_GROUPS;
