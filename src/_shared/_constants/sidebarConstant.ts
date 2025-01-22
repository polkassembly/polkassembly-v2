// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EGovType, ENetwork, EPostOrigin, ISidebarMenuItem, ITrackCounts } from '../types';
import { NETWORKS_DETAILS } from './networks';

const ActiveItems = (items: ISidebarMenuItem[], pathname: string): ISidebarMenuItem[] =>
	items.map((item) => ({
		...item,
		isActive: pathname === item.url,
		items: item.items ? ActiveItems(item.items, pathname) : undefined
	}));
const getTrackItems = (networkKey: ENetwork, trackGroup: string, t: (key: string) => string, trackCounts?: Record<string, number>) => {
	// eslint-disable-next-line
	const tracks = NETWORKS_DETAILS[networkKey]?.tracks || {};
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
				// eslint-disable-next-line
				count: trackCounts?.[trackKey] || 0,
				icon: undefined
			};
		});
};

const getOriginIcon = (key: string) => {
	switch (key) {
		case EPostOrigin.ROOT:
			return 'sidebar/root-icon';
		case EPostOrigin.TREASURER:
			return 'sidebar/treasurer-icon';
		case EPostOrigin.WISH_FOR_CHANGE:
			return 'sidebar/wish-for-change-icon';
		case EPostOrigin.REFERENDUM_CANCELLER:
			return 'sidebar/referendum-cancellor-icon';
		case EPostOrigin.REFERENDUM_KILLER:
			return 'sidebar/referendum-killer-icon';
		case EPostOrigin.WHITELISTED_CALLER:
			return 'sidebar/whitelisted-caller-icon';
		case EPostOrigin.FELLOWSHIP_ADMIN:
			return 'sidebar/fellowship-admin-icon';
		default:
			return null;
	}
};

const getOriginsItems = (networkKey: ENetwork, t: (key: string) => string) => {
	const tracks = NETWORKS_DETAILS[networkKey]?.tracks || {};
	return Object.entries(tracks)
		.filter(([, track]) => track.group === 'Origin')
		.map(([key, track]) => {
			const translationKey = `Sidebar.${key}`;
			const icon = getOriginIcon(key);
			return {
				title: t(translationKey),
				url: `/${track.name.toLowerCase().replace(/_/g, '-')}`,
				icon: icon || undefined
			};
		});
};

export const getSidebarData = (networkKey: ENetwork, pathname: string, t: (key: string) => string, trackCounts: ITrackCounts = {}) => {
	const network = NETWORKS_DETAILS[networkKey as ENetwork];
	if (!network) {
		throw new Error(`Network ${networkKey} not found`);
	}

	const baseConfig = {
		heading: t('Sidebar.main'),
		initalItems: ActiveItems(
			[
				{ title: t('Sidebar.home'), url: '/', icon: 'sidebar/homeicon' },
				{ title: t('Sidebar.discussions'), url: '/discussions', icon: 'sidebar/discussion-icon' }
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
						{ title: t('Sidebar.preimages'), url: '/preimages', icon: 'sidebar/preimages' },
						{ title: t('Sidebar.delegation'), url: '#', icon: 'sidebar/delegation' },
						{
							title: t('Sidebar.bounty'),
							url: '',
							icon: 'sidebar/bounty',
							isNew: true,
							items: [
								{
									title: t('Sidebar.bountyDashboard'),
									url: '#',
									count: trackCounts.bounty_dashboard || 0
								},
								{ title: t('Sidebar.onChainBounties'), url: '/bounty/onchain-bounty' }
							]
						},
						{ title: t('Sidebar.batchVoting'), url: '#', icon: 'sidebar/batch-voting', isNew: true }
					],
					pathname
				),
				mainItems: ActiveItems(
					[
						{
							heading: t('Sidebar.tracks'),
							title: t('Sidebar.tracks'),
							url: '',
							items: ActiveItems(
								[
									{
										title: t('Sidebar.treasury'),
										url: '',
										icon: 'sidebar/treasury-icon',
										items: getTrackItems(networkKey, 'Treasury', t, trackCounts)
									},
									{
										title: t('Sidebar.administration'),
										url: '',
										icon: 'sidebar/admin-icon',
										items: getTrackItems(networkKey, 'Main', t, trackCounts)
									}
								],
								pathname
							)
						},
						{
							heading: t('Sidebar.origins'),
							title: t('Sidebar.origins'),
							url: '',
							items: ActiveItems(getOriginsItems(networkKey, t), pathname)
						}
					],
					pathname
				),
				endItems: ActiveItems(
					[
						{ title: t('Sidebar.govAnalytics'), url: '/gov-analytics', icon: 'sidebar/gov-analytics-icon' },
						{ title: t('Sidebar.calendar'), url: '/calendar', icon: 'sidebar/calendar-icon' },
						{
							title: t('Sidebar.community'),
							url: '/community',
							icon: 'sidebar/community-icon',
							items: [
								{ title: t('Sidebar.members'), url: '/members' },
								{ title: t('Sidebar.ecosystemProjects'), url: '/ecosystem-projects' }
							]
						},
						{ title: t('Sidebar.parachains'), url: '/parachains', icon: 'sidebar/parachains-icon' },
						{
							title: t('Sidebar.archived'),
							url: '/archived',
							icon: 'sidebar/archived-icon',
							items: [
								{
									title: t('Sidebar.democracy'),
									url: '#',
									items: [
										{ title: t('Sidebar.proposals'), url: '/proposals', icon: 'sidebar/democracy-proposal-icon' },
										{ title: t('Sidebar.referenda'), url: '/referenda', icon: 'sidebar/democracy-referenda-icon' }
									]
								},
								{
									title: t('Sidebar.treasury'),
									url: '#',
									items: [
										{ title: t('Sidebar.treasuryProposals'), url: '/treasury-proposals', icon: 'sidebar/treasury-proposal-icon' },
										{ title: t('Sidebar.tips'), url: '/tips', icon: 'sidebar/tips-icon' }
									]
								},
								{
									title: t('Sidebar.council'),
									url: '#',
									items: [
										{ title: t('Sidebar.motions'), url: '/motions', icon: 'sidebar/council-motion-icon' },
										{ title: t('Sidebar.members'), url: '/members', icon: 'sidebar/council-members-icon' }
									]
								},
								{
									title: t('Sidebar.techComm'),
									url: '#',
									items: [{ title: t('Sidebar.techCommProposals'), url: '/tech-comm-proposals', icon: 'sidebar/tech-comm-proposals-icon' }]
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
