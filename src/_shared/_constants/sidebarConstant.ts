// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Home from '@assets/sidebar/homeicon.svg';
import Discussion from '@assets/sidebar/discussion.svg';
import Preimages from '@assets/sidebar/preimages.svg';
import Delegation from '@assets/sidebar/delegation.svg';
import Bounty from '@assets/sidebar/bounty.svg';
import BatchVoting from '@assets/sidebar/batch-voting.svg';
import GovAnalytics from '@assets/sidebar/gov-analytics-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import CalendarIcon from '@assets/sidebar/calendar-icon.svg';
import CommunityIcon from '@assets/sidebar/community-icon.svg';
import ParachainsIcon from '@assets/sidebar/parachains-icon.svg';
import ArchivedIcon from '@assets/sidebar/archived-icon.svg';
import AdministrationIcon from '@assets/sidebar/admin-icon.svg';
import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasurerIcon from '@assets/sidebar/treasurer-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import ReferendumCancellorIcon from '@assets/sidebar/referendum-cancellor-icon.svg';
import ReferendumKillerIcon from '@assets/sidebar/referendum-killer-icon.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import FellowshipAdminIcon from '@assets/sidebar/fellowship-admin-icon.svg';
import { chainProperties, network } from './networkConstants';
import { Item } from '../types';

const capitalizeWords = (text: string) =>
	text
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');

const ActiveItems = (items: Item[], pathname: string): Item[] => {
	return items.map((item) => ({
		...item,
		isActive: pathname === item.url,
		items: item.items ? ActiveItems(item.items, pathname) : undefined
	}));
};

const getTrackItems = (trackGroup: string) => {
	const tracks = chainProperties[network.ROCOCO]?.tracks || {};

	return (
		Object.entries(tracks)
			.filter(([key, track]) => {
				if (trackGroup === 'Main') {
					return (track.group === trackGroup || key === 'GENERAL_ADMIN' || key === 'LEASE_ADMIN') && key !== 'ROOT';
				}
				if (trackGroup === 'Treasury') {
					return track.group === trackGroup && key !== 'TREASURER';
				}
				return track.group === trackGroup;
			})
			// eslint-disable-next-line
			.map(([key, track]) => ({
				title: capitalizeWords(track.name),
				url: `/${track.name.toLowerCase().replace(/_/g, '-')}`,
				count: track.maxDeciding,
				icon: undefined
			}))
	);
};

const getOriginsItems = () => {
	const origins = [
		{ key: 'ROOT', icon: RootIcon },
		{ key: 'TREASURER', icon: TreasurerIcon },
		{ key: 'WISH_FOR_CHANGE', icon: WishForChangeIcon },
		{ key: 'REFERENDUM_CANCELLER', icon: ReferendumCancellorIcon },
		{ key: 'REFERENDUM_KILLER', icon: ReferendumKillerIcon },
		{ key: 'WHITELISTED_CALLER', icon: WhitelistedCallerIcon },
		{ key: 'FELLOWSHIP_ADMIN', icon: FellowshipAdminIcon }
	];

	return origins.map(({ key, icon }) => ({
		title: capitalizeWords(key),
		url: `/${key.toLowerCase().replace(/_/g, '-')}`,
		// eslint-disable-next-line
		count: chainProperties[network.ROCOCO]?.tracks?.[key]?.maxDeciding ?? 0,
		icon
	}));
};

export const getSidebarData = (pathname: string) => {
	return [
		{
			heading: 'Main',
			initalItems: ActiveItems(
				[
					{ title: 'Home', url: '/open-gov', icon: Home },
					{ title: 'Discussions', url: '/discussions', icon: Discussion },
					{ title: 'Preimages', url: '/preimages', icon: Preimages },
					{ title: 'Delegation', url: '/delegation', icon: Delegation },
					{
						title: 'Bounty',
						url: '/bounty',
						icon: Bounty,
						isNew: true,
						items: [
							{ title: 'Bounty Dashboard', url: '/bounty/dashboard', count: 8 },
							{ title: 'On-chain Bounties', url: '/bounty/onchain' }
						]
					},
					{ title: 'Batch Voting', url: '/batch-voting', icon: BatchVoting, isNew: true }
				],
				pathname
			),
			mainItems: ActiveItems(
				[
					{
						heading: 'TRACKS',
						title: 'TRACKS',
						url: '',
						items: ActiveItems(
							[
								{
									title: 'Treasury',
									url: '',
									icon: TreasuryIcon,
									items: getTrackItems('Treasury')
								},
								{
									title: 'Administration',
									url: '',
									icon: AdministrationIcon,
									items: getTrackItems('Main')
								}
							],
							pathname
						)
					},
					{
						heading: 'ORIGINS',
						title: 'ORIGINS',
						url: '',
						items: ActiveItems(getOriginsItems(), pathname)
					}
				],
				pathname
			),
			endItems: ActiveItems(
				[
					{ title: 'Gov Analytics', url: '/gov-analytics', icon: GovAnalytics },
					{ title: 'Calendar', url: '/calendar', icon: CalendarIcon },
					{
						title: 'Community',
						url: '/community',
						icon: CommunityIcon,
						items: [
							{ title: 'Members', url: '/Members' },
							{ title: 'On-Ecosystem Projects', url: '/ecosystem-projects', count: 5 }
						]
					},
					{ title: 'Parachains', url: '/parachains', icon: ParachainsIcon },
					{ title: 'Archived', url: '/archived', icon: ArchivedIcon }
				],
				pathname
			)
		}
	];
};
