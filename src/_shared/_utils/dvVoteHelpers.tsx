// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Ban } from 'lucide-react';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';

export const getVoteColor = (vote: string) => {
	switch (vote) {
		case 'aye':
			return 'bg-dv_voting_card_aye_bg_color text-social_green';
		case 'nay':
			return 'bg-dv_voting_card_nay_bg_color text-failure';
		case 'abstain':
			return 'bg-dv_voting_card_abstain_bg_color text-dv_abstain_color';
		default:
			return 'bg-activity_selected_tab text-text_primary';
	}
};

export const getVoteIcon = (vote: string) => {
	switch (vote) {
		case 'aye':
			return <AiFillLike size={16} />;
		case 'nay':
			return <AiFillDislike size={16} />;
		case 'abstain':
			return <Ban size={16} />;
		default:
			return <p>-</p>;
	}
};

export const getVoteBarColor = (vote: string) => {
	switch (vote) {
		case 'aye':
			return 'bg-social_green';
		case 'nay':
			return 'bg-failure';
		case 'abstain':
			return 'bg-dv_voting_card_abstain_bar_color';
		default:
			return 'bg-activity_selected_tab';
	}
};
