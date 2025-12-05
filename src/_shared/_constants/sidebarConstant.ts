// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Home from '@assets/sidebar/homeicon.svg';
import Discussion from '@assets/sidebar/discussion-icon.svg';
import Preimages from '@assets/sidebar/preimages.svg';
import Delegation from '@assets/sidebar/delegation.svg';
import ReferendaIcon from '@assets/sidebar/referenda-icon.svg';
import Bounty from '@assets/sidebar/bounty.svg';
import BatchVoting from '@assets/sidebar/batch-voting.svg';
import AnalyticsIcon from '@assets/sidebar/gov-analytics-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import CommunityIcon from '@assets/sidebar/community-icon.svg';
import MoreIcon from '@assets/sidebar/more-circle-icon.svg';
import DemocraryProposalIcon from '@assets/sidebar/democracy-proposal-icon.svg';
import DemocraryReferendumIcon from '@assets/sidebar/democracy-referenda-icon.svg';
import TreasuryProposalIcon from '@assets/sidebar/treasury-proposal-icon.svg';
import TreasuryTipIcon from '@assets/sidebar/tips-icon.svg';
import CouncilMotionIcon from '@assets/sidebar/council-motion-icon.svg';
import CouncilMemberIcon from '@assets/sidebar/council-members-icon.svg';
import TechCommIcon from '@assets/sidebar/tech-comm-proposals-icon.svg';
import { EGovType, ENetwork, ISidebarMenuItem, ITrackCounts } from '../types';
import { NETWORKS_DETAILS } from './networks';

const ActiveItems = (items: ISidebarMenuItem[], pathname: string): ISidebarMenuItem[] =>
	items.map((item) => ({
		...item,
		isActive: pathname === item.url,
		items: item.items ? ActiveItems(item.items, pathname) : undefined
	}));
const getTrackItems = (networkKey: ENetwork, trackGroup: string, t: (key: string) => string, trackCounts?: Record<string, number>) => {
	const tracks = NETWORKS_DETAILS[`${networkKey}`]?.trackDetails || {};
	return Object.entries(tracks)
		.filter(([, track]) => track.group === trackGroup)
		.map(([trackKey, track]) => {
			const formattedName = track.name
				.split('_')
				.map((word: string) => {
					return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
				})
				.join('');
			const translationKey = `ListingPage.${formattedName}`;
			return {
				title: t(translationKey),
				url: `/${track.name.toLowerCase().replace(/_/g, '-')}`,
				count: trackCounts?.[trackKey as string] || 0,
				icon: undefined
			};
		});
};

export const getSidebarData = (networkKey: ENetwork, pathname: string, t: (key: string) => string, trackCounts: ITrackCounts = {}) => {
	const network = NETWORKS_DETAILS[networkKey as ENetwork];
	if (!network) {
		throw new Error(`Network ${networkKey} not found`);
	}

	const TREASURY_KEY = 'Sidebar.treasury';
	const REFERENDA_KEY = 'Sidebar.referenda';

	const baseConfig = {
		heading: t('Sidebar.main'),
		initalItems: ActiveItems(
			[
				{ title: t('Sidebar.home'), url: '/', icon: Home },
				{ title: t('Sidebar.discussions'), url: '/discussions', icon: Discussion }
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
						{ title: t('Sidebar.delegation'), url: '/delegation', icon: Delegation },
						{ title: t('Sidebar.batchVoting'), url: '/batch-voting', icon: BatchVoting }
					],
					pathname
				),
				mainItems: ActiveItems(
					[
						{
							title: t(TREASURY_KEY),
							url: '',
							icon: TreasuryIcon,
							isNew: false,
							items: [...getTrackItems(networkKey, 'Treasury', t, trackCounts)]
						},
						{
							title: t('Sidebar.bounty'),
							url: '',
							icon: Bounty,
							isNew: false,
							items: [
								{
									title: t('Sidebar.bountyDashboard'),
									url: '/bounty-dashboard',
									count: trackCounts.bounty_dashboard || 0
								},
								{ title: t('Sidebar.onChainBounties'), url: '/bounties' },
								{ title: t('Sidebar.childBounties'), url: '/child-bounties' }
							]
						},
						{
							title: t(REFERENDA_KEY),
							url: '',
							icon: ReferendaIcon,
							items: [
								{
									title: t('ActivityFeed.Navbar.All'),
									url: '/all',
									icon: undefined
								},
								...getTrackItems(networkKey, 'Main', t, trackCounts),
								...getTrackItems(networkKey, 'Origin', t, trackCounts)
							]
						},
						{
							title: t('Sidebar.analytics'),
							url: '',
							icon: AnalyticsIcon,
							items: [
								{ title: t('Sidebar.govAnalytics'), url: '/gov-analytics' },
								{ title: t('Sidebar.treasuryAnalytics'), url: '/treasury-analytics' }
							]
						},
						{
							title: t('Sidebar.community'),
							url: '#',
							icon: CommunityIcon,
							items: [
								{ title: t('Sidebar.proxies'), url: '/proxies' },
								{ title: t('Sidebar.identityAndJudgement'), url: '/judgements' }
							]
						},
						{ title: t('Sidebar.preimages'), url: '/preimages', icon: Preimages }
					],
					pathname
				),
				endItems: ActiveItems(
					[
						{
							title: t('Sidebar.more'),
							url: '#',
							icon: MoreIcon,
							items: [
								{ title: t('Sidebar.parachains'), url: '/parachains' },
								{
									title: t('Sidebar.gov1'),
									url: '#',
									renderAsParentItem: true,
									items: [
										{
											title: t('Sidebar.democracy'),
											url: '#',
											items: [
												{ title: t('Sidebar.proposals'), url: '/proposals', icon: DemocraryProposalIcon },
												{ title: t('Sidebar.referenda'), url: '/referenda', icon: DemocraryReferendumIcon }
											]
										},
										{
											title: t('Sidebar.treasury'),
											url: '#',
											items: [
												{ title: t('Sidebar.treasuryProposals'), url: '/treasury-proposals', icon: TreasuryProposalIcon },
												{ title: t('Sidebar.tips'), url: '/tips', icon: TreasuryTipIcon }
											]
										},
										{
											title: t('Sidebar.council'),
											url: '#',
											items: [
												{ title: t('Sidebar.motions'), url: '/motions', icon: CouncilMotionIcon },
												{ title: t('Sidebar.members'), url: '/members', icon: CouncilMemberIcon }
											]
										},
										{
											title: t('Sidebar.techComm'),
											url: '#',
											items: [{ title: t('Sidebar.techCommProposals'), url: '/tech-comm-proposals', icon: TechCommIcon }]
										}
									]
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
