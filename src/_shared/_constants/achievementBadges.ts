// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import DecentralisedVoice from '@assets/icons/dv-badge.svg';
import Fellow from '@assets/icons/fellow-badge.svg';
import Council from '@assets/icons/council-badge.svg';
import ActiveVoter from '@assets/icons/av-badge.svg';
import Whale from '@assets/icons/whale-badge.svg';
import { EUserBadge } from '../types';

interface IBadge {
	name: EUserBadge;
	image: string;
	displayName: string;
	description: string;
}

export const achievementBadges: Record<EUserBadge, IBadge> = {
	[EUserBadge.DECENTRALISED_VOICE]: {
		name: EUserBadge.DECENTRALISED_VOICE,
		image: DecentralisedVoice,
		displayName: 'Decentralised Voice',
		description: ''
	},
	[EUserBadge.FELLOW]: {
		name: EUserBadge.FELLOW,
		image: Fellow,
		displayName: 'Fellow',
		description: ''
	},
	[EUserBadge.COUNCIL]: {
		name: EUserBadge.COUNCIL,
		image: Council,
		displayName: 'Council',
		description: ''
	},
	[EUserBadge.ACTIVE_VOTER]: {
		name: EUserBadge.ACTIVE_VOTER,
		image: ActiveVoter,
		displayName: 'Active Voter',
		description: ''
	},
	[EUserBadge.WHALE]: {
		name: EUserBadge.WHALE,
		image: Whale,
		displayName: 'Whale',
		description: ''
	},
	[EUserBadge.STEADFAST_COMMENTOR]: {
		name: EUserBadge.STEADFAST_COMMENTOR,
		image: Whale,
		displayName: 'Steadfast Commentor',
		description: ''
	},
	[EUserBadge.GM_VOTER]: {
		name: EUserBadge.GM_VOTER,
		image: Whale,
		displayName: 'GM Voter',
		description: ''
	},
	[EUserBadge.POPULAR_DELEGATE]: {
		name: EUserBadge.POPULAR_DELEGATE,
		image: Whale,
		displayName: 'Popular Delegate',
		description: ''
	}
};
