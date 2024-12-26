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
import DemocraryProposalIcon from '@assets/sidebar/democracy-proposal-icon.svg';
import DemocraryReferendumIcon from '@assets/sidebar/democracy-referenda-icon.svg';
import TreasuryProposalIcon from '@assets/sidebar/treasury-proposal-icon.svg';
import TreasuryTipIcon from '@assets/sidebar/tips-icon.svg';
import CouncilMotionIcon from '@assets/sidebar/council-motion-icon.svg';
import CouncilMemberIcon from '@assets/sidebar/council-members-icon.svg';
import TechCommIcon from '@assets/sidebar/tech-comm-proposals-icon.svg';
import { EGovType, ENetwork, EPostOrigin, ISidebarMenuItem, ITrackCounts } from '../types';
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
		case EPostOrigin.ROOT:
			return RootIcon;
		case EPostOrigin.TREASURER:
			return TreasurerIcon;
		case EPostOrigin.WISH_FOR_CHANGE:
			return WishForChangeIcon;
		case EPostOrigin.REFERENDUM_CANCELLER:
			return ReferendumCancellorIcon;
		case EPostOrigin.REFERENDUM_KILLER:
			return ReferendumKillerIcon;
		case EPostOrigin.WHITELISTED_CALLER:
			return WhitelistedCallerIcon;
		case EPostOrigin.FELLOWSHIP_ADMIN:
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
				{ title: 'Home', url: '#', icon: Home },
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
						{ title: 'Preimages', url: '#', icon: Preimages },
						{ title: 'Delegation', url: '#', icon: Delegation },
						{
							title: 'Bounty',
							url: '',
							icon: Bounty,
							isNew: true,
							items: [
								{
									title: 'Bounty Dashboard',
									url: '#',
									count: trackCounts.bounty_dashboard || 0
								},
								{ title: 'On-chain Bounties', url: '/bounty/onchain-bounty' }
							]
						},
						{ title: 'Batch Voting', url: '#', icon: BatchVoting, isNew: true }
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
								{ title: 'Ecosystem Projects', url: '/ecosystem-projects' }
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
									items: [
										{ title: 'Proposals', url: '/proposals', icon: DemocraryProposalIcon },
										{ title: 'Referenda', url: '/referenda', icon: DemocraryReferendumIcon }
									]
								},
								{
									title: 'Treasury',
									url: '#',
									items: [
										{ title: 'Treasury Proposals', url: '/treasury-proposals', icon: TreasuryProposalIcon },
										{ title: 'Tips', url: '/tips', icon: TreasuryTipIcon }
									]
								},
								{
									title: 'Council',
									url: '#',
									items: [
										{ title: 'Motions', url: '/motions', icon: CouncilMotionIcon },
										{ title: 'Members', url: '/members', icon: CouncilMemberIcon }
									]
								},
								{
									title: 'Tech. Comm.',
									url: '#',
									items: [{ title: 'Tech Comm Proposals', url: '/tech-comm-proposals', icon: TechCommIcon }]
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
