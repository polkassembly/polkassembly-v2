// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Home from '@assets/sidebar/homeicon.svg';
import Discussion from '@assets/sidebar/discussion-icon.svg';
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
import { EGovType, ENetwork, ISidebarMenuItem, ITrackCounts } from '../types';
import { NETWORKS_DETAILS } from './networks';

const capitalizeWords = (text: string) =>
	text
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');

const ActiveItems = (items: ISidebarMenuItem[], pathname: string): ISidebarMenuItem[] =>
	items.map((item) => ({
		...item,
		isActive: pathname === item.url,
		items: item.items ? ActiveItems(item.items, pathname) : undefined
	}));
const getTrackItems = (networkKey: ENetwork, trackGroup: string, trackCounts?: Record<string, number>) => {
	// eslint-disable-next-line
	const tracks = NETWORKS_DETAILS[networkKey]?.tracks || {};
	return Object.entries(tracks)
		.filter(([, track]) => track.group === trackGroup)
		.map(([trackKey, track]) => ({
			title: capitalizeWords(track.name),
			url: `/${track.name.toLowerCase().replace(/_/g, '-')}`,
			// eslint-disable-next-line
			count: trackCounts?.[trackKey] || 0,
			icon: undefined
		}));
};

const getOriginIcon = (key: string) => {
	switch (key) {
		case 'root':
			return RootIcon;
		case 'Treasurer':
			return TreasurerIcon;
		case 'WishForChange':
			return WishForChangeIcon;
		case 'ReferendumCanceller':
			return ReferendumCancellorIcon;
		case 'ReferendumKiller':
			return ReferendumKillerIcon;
		case 'WhitelistedCaller':
			return WhitelistedCallerIcon;
		case 'FellowshipAdmin':
			return FellowshipAdminIcon;
		default:
			return null;
	}
};

const getOriginsItems = (networkKey: ENetwork) => {
	// eslint-disable-next-line
	const tracks = NETWORKS_DETAILS[networkKey]?.tracks || {};
	return Object.entries(tracks)
		.filter(([, track]) => track.group === 'Origin')
		.map(([key, track]) => ({
			title: capitalizeWords(track.name),
			url: `/${track.name.toLowerCase().replace(/_/g, '-')}`,
			icon: getOriginIcon(key)
		}));
};

export const getSidebarData = (networkKey: ENetwork, pathname: string, trackCounts: ITrackCounts = {}) => {
	// eslint-disable-next-line
	const network = NETWORKS_DETAILS[networkKey];
	if (!network) {
		throw new Error(`Network ${networkKey} not found`);
	}

	const baseConfig = {
		heading: 'Main',
		initalItems: ActiveItems(
			[
				{ title: 'Home', url: '/open-gov', icon: Home },
				{ title: 'Discussions', url: '/discussions', icon: Discussion }
			],
			pathname
		),
		mainItems: [],
		endItems: []
	};

	if (network.govtype === EGovType.OPENGOV) {
		return [
			{
				...baseConfig,
				initalItems: ActiveItems(
					[
						...baseConfig.initalItems,
						{ title: 'Preimages', url: '/preimages', icon: Preimages },
						{ title: 'Delegation', url: '/delegation', icon: Delegation },
						{
							title: 'Bounty',
							url: '/bounty',
							icon: Bounty,
							isNew: true,
							items: [
								{
									title: 'Bounty Dashboard',
									url: '/bounty/dashboard',
									count: trackCounts.bounty_dashboard || 0
								},
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
										items: getTrackItems(networkKey, 'Treasury', trackCounts)
									},
									{
										title: 'Administration',
										url: '',
										icon: AdministrationIcon,
										items: getTrackItems(networkKey, 'Main', trackCounts)
									}
								],
								pathname
							)
						},
						{
							heading: 'ORIGINS',
							title: 'ORIGINS',
							url: '',
							items: ActiveItems(getOriginsItems(networkKey), pathname)
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
								{ title: 'Members', url: '/members' },
								{ title: 'On-Ecosystem Projects', url: '/ecosystem-projects' }
							]
						},
						{ title: 'Parachains', url: '/parachains', icon: ParachainsIcon },
						{
							title: 'Archived',
							url: '/archived',
							icon: ArchivedIcon,
							items: [
								{
									title: 'Democracy',
									url: '#',
									icon: ParachainsIcon,
									items: [
										{ title: 'Proposals', url: '/proposals' },
										{ title: 'Referenda', url: '/referenda' }
									]
								},
								{
									title: 'Treasury',
									url: '#',
									icon: ParachainsIcon,
									items: [
										{ title: 'Treasury Proposals', url: '/treasury-proposals' },
										{ title: 'Tips', url: '/tips' }
									]
								},
								{
									title: 'Council',
									url: '#',
									icon: ParachainsIcon,
									items: [
										{ title: 'Motions', url: '/motions' },
										{ title: 'Members', url: '/members' }
									]
								},
								{
									title: 'Tech. Comm.',
									url: '#',
									icon: ParachainsIcon,
									items: [{ title: 'Tech Comm Proposals', url: '/tech-comm-proposals' }]
								}
							]
						}
					],
					pathname
				)
			}
		];
	}

	return [baseConfig];
};
