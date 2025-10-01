// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { ENetwork, EPostOrigin, EProposalType } from '@/_shared/types';
import AdvancedSettingsIcon from '@assets/icons/notification-settings/advancedsettings.svg';
import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasurerIcon from '@assets/sidebar/treasurer-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import ReferendumCancellorIcon from '@assets/sidebar/referendum-cancellor-icon.svg';
import ReferendumKillerIcon from '@assets/sidebar/referendum-killer-icon.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import FellowshipAdminIcon from '@assets/sidebar/fellowship-admin-icon.svg';
import AdministrationIcon from '@assets/sidebar/admin-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import DemocracyReferendaIcon from '@assets/sidebar/democracy-referenda-icon.svg';
import ProposalIcon from '@assets/sidebar/proposal-icon.svg';
import BountyIcon from '@assets/sidebar/bounty.svg';
import TipsIcon from '@assets/sidebar/tips-icon.svg';
import TechCommProposalsIcon from '@assets/sidebar/tech-comm-proposals-icon.svg';
import CouncilMotionIcon from '@assets/sidebar/council-motion-icon.svg';
import TrackItem from '../components/TrackItem';
import Gov1Item from '../components/Gov1Item';
import classes from '../Notifications.module.scss';

const getOriginIcon = (origin: EPostOrigin) => {
	switch (origin) {
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
		case EPostOrigin.STAKING_ADMIN:
		case EPostOrigin.AUCTION_ADMIN:
		case EPostOrigin.LEASE_ADMIN:
		case EPostOrigin.GENERAL_ADMIN:
			return AdministrationIcon;
		case EPostOrigin.SMALL_TIPPER:
		case EPostOrigin.BIG_TIPPER:
		case EPostOrigin.SMALL_SPENDER:
		case EPostOrigin.MEDIUM_SPENDER:
		case EPostOrigin.BIG_SPENDER:
			return TreasuryIcon;
		default:
			return AdministrationIcon;
	}
};

const getGov1Icon = (itemKey: string) => {
	switch (itemKey) {
		case 'mentionsIReceive':
			return AdministrationIcon;
		case EProposalType.REFERENDUM:
			return DemocracyReferendaIcon;
		case EProposalType.DEMOCRACY_PROPOSAL:
			return ProposalIcon;
		case EProposalType.BOUNTY:
			return BountyIcon;
		case EProposalType.CHILD_BOUNTY:
			return BountyIcon;
		case EProposalType.TIP:
			return TipsIcon;
		case EProposalType.TECHNICAL_COMMITTEE:
			return TechCommProposalsIcon;
		case EProposalType.COUNCIL_MOTION:
			return CouncilMotionIcon;
		default:
			return AdministrationIcon;
	}
};

const getGov1NotificationLabels = (itemKey: string, t: (key: string) => string): { [key: string]: string } | undefined => {
	switch (itemKey) {
		case EProposalType.REFERENDUM:
			return {
				newReferendumSubmitted: t('Profile.Settings.Notifications.newReferendumSubmitted'),
				referendumInVoting: t('Profile.Settings.Notifications.referendumInVoting'),
				referendumClosed: t('Profile.Settings.Notifications.referendumClosed')
			};
		case EProposalType.DEMOCRACY_PROPOSAL:
			return {
				newProposalsSubmitted: t('Profile.Settings.Notifications.newProposalsSubmitted'),
				proposalInVoting: t('Profile.Settings.Notifications.proposalInVoting'),
				proposalClosed: t('Profile.Settings.Notifications.proposalClosed')
			};
		case EProposalType.BOUNTY:
			return {
				bountiesSubmitted: t('Profile.Settings.Notifications.bountiesSubmitted'),
				bountiesClosed: t('Profile.Settings.Notifications.bountiesClosed')
			};
		case EProposalType.CHILD_BOUNTY:
			return {
				childBountiesSubmitted: t('Profile.Settings.Notifications.childBountiesSubmitted'),
				childBountiesClosed: t('Profile.Settings.Notifications.childBountiesClosed')
			};
		case EProposalType.TIP:
			return {
				newTipsSubmitted: t('Profile.Settings.Notifications.newTipsSubmitted'),
				tipsOpened: t('Profile.Settings.Notifications.tipsOpened'),
				tipsClosed: t('Profile.Settings.Notifications.tipsClosed')
			};
		case EProposalType.TECHNICAL_COMMITTEE:
			return {
				newTechCommitteeProposalsSubmitted: t('Profile.Settings.Notifications.newTechCommitteeProposalsSubmitted'),
				proposalsClosed: t('Profile.Settings.Notifications.proposalsClosed')
			};
		case EProposalType.COUNCIL_MOTION:
			return {
				newMotionsSubmitted: t('Profile.Settings.Notifications.newMotionsSubmitted'),
				motionInVoting: t('Profile.Settings.Notifications.motionInVoting'),
				motionClosed: t('Profile.Settings.Notifications.motionClosed')
			};
		case 'mentionsIReceive':
			return undefined;
		default:
			return undefined;
	}
};

const getTrackLabels = (t: (key: string) => string): Record<string, { origin: EPostOrigin; label: string }> => ({
	root: { origin: EPostOrigin.ROOT, label: t('Sidebar.Root') },
	stakingAdmin: { origin: EPostOrigin.STAKING_ADMIN, label: t('ListingPage.StakingAdmin') },
	auctionAdmin: { origin: EPostOrigin.AUCTION_ADMIN, label: t('Sidebar.AuctionAdmin') },
	treasurer: { origin: EPostOrigin.TREASURER, label: t('Sidebar.Treasurer') },
	referendumCanceller: { origin: EPostOrigin.REFERENDUM_CANCELLER, label: t('Sidebar.ReferendumCanceller') },
	referendumKiller: { origin: EPostOrigin.REFERENDUM_KILLER, label: t('Sidebar.ReferendumKiller') },
	leaseAdmin: { origin: EPostOrigin.LEASE_ADMIN, label: t('Sidebar.LeaseAdmin') },
	memberReferenda: { origin: EPostOrigin.MEMBERS, label: t('Sidebar.members') },
	smallTipper: { origin: EPostOrigin.SMALL_TIPPER, label: t('Sidebar.SmallTipper') },
	bigTipper: { origin: EPostOrigin.BIG_TIPPER, label: t('Sidebar.BigTipper') },
	smallSpender: { origin: EPostOrigin.SMALL_SPENDER, label: t('Sidebar.SmallSpender') },
	mediumSpender: { origin: EPostOrigin.MEDIUM_SPENDER, label: t('Sidebar.MediumSpender') },
	bigSpender: { origin: EPostOrigin.BIG_SPENDER, label: t('Sidebar.BigSpender') },
	fellowshipAdmin: { origin: EPostOrigin.FELLOWSHIP_ADMIN, label: t('Sidebar.FellowshipAdmin') },
	generalAdmin: { origin: EPostOrigin.GENERAL_ADMIN, label: t('Sidebar.GeneralAdmin') },
	whitelistedCaller: { origin: EPostOrigin.WHITELISTED_CALLER, label: t('Sidebar.WhitelistedCaller') }
});

const getGov1Labels = (t: (key: string) => string): Record<string, { label: string }> => ({
	mentionsIReceive: { label: t('Profile.Settings.Notifications.mentionsIReceive') },
	[EProposalType.REFERENDUM]: { label: t('Sidebar.referenda') },
	[EProposalType.DEMOCRACY_PROPOSAL]: { label: t('Sidebar.proposals') },
	[EProposalType.BOUNTY]: { label: t('Sidebar.bounty') },
	[EProposalType.CHILD_BOUNTY]: { label: t('Sidebar.childBounties') },
	[EProposalType.TIP]: { label: t('Sidebar.tips') },
	[EProposalType.TECHNICAL_COMMITTEE]: { label: t('Sidebar.techComm') },
	[EProposalType.COUNCIL_MOTION]: { label: t('Sidebar.motions') }
});

interface AdvancedSettingsSectionProps {
	network: ENetwork;
}

function AdvancedSettingsSection({ network }: AdvancedSettingsSectionProps) {
	console.log('current network', network);
	const t = useTranslations();

	const [openGovTracks, setOpenGovTracks] = useState({
		root: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		stakingAdmin: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		auctionAdmin: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		treasurer: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		referendumCanceller: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		referendumKiller: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		leaseAdmin: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		memberReferenda: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		smallTipper: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		bigTipper: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		smallSpender: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		mediumSpender: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		bigSpender: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		fellowshipAdmin: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		generalAdmin: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		whitelistedCaller: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } }
	});

	const [gov1Items, setGov1Items] = useState({
		mentionsIReceive: { enabled: false, notifications: {} },
		[EProposalType.REFERENDUM]: { enabled: false, notifications: { newReferendumSubmitted: false, referendumInVoting: false, referendumClosed: false } },
		[EProposalType.DEMOCRACY_PROPOSAL]: { enabled: false, notifications: { newProposalsSubmitted: false, proposalInVoting: false, proposalClosed: false } },
		[EProposalType.BOUNTY]: { enabled: false, notifications: { bountiesSubmitted: false, bountiesClosed: false } },
		[EProposalType.CHILD_BOUNTY]: { enabled: false, notifications: { childBountiesSubmitted: false, childBountiesClosed: false } },
		[EProposalType.TIP]: { enabled: false, notifications: { newTipsSubmitted: false, tipsOpened: false, tipsClosed: false } },
		[EProposalType.TECHNICAL_COMMITTEE]: { enabled: false, notifications: { newTechCommitteeProposalsSubmitted: false, proposalsClosed: false } },
		[EProposalType.COUNCIL_MOTION]: { enabled: false, notifications: { newMotionsSubmitted: false, motionInVoting: false, motionClosed: false } }
	});

	const trackLabels = getTrackLabels(t);
	const gov1Labels = getGov1Labels(t);

	const handleOpenGovTrackChange = (trackKey: string, enabled: boolean) => {
		setOpenGovTracks((prev) => ({
			...prev,
			[trackKey]: {
				...prev[trackKey as keyof typeof prev],
				enabled,
				notifications: {
					newReferendumSubmitted: enabled,
					referendumInVoting: enabled,
					referendumClosed: enabled
				}
			}
		}));
		console.log(trackKey, enabled);
		// TODO: Implement backend integration
	};

	const handleOpenGovNotificationChange = (trackKey: string, notificationKey: string, enabled: boolean) => {
		setOpenGovTracks((prev) => {
			const updatedNotifications = {
				...prev[trackKey as keyof typeof prev]?.notifications,
				[notificationKey]: enabled
			};

			const allNotificationsEnabled = Object.values(updatedNotifications).every((val) => val === true);

			return {
				...prev,
				[trackKey]: {
					...prev[trackKey as keyof typeof prev],
					enabled: allNotificationsEnabled,
					notifications: updatedNotifications
				}
			};
		});
		console.log(trackKey, notificationKey, enabled);
		// TODO: Implement backend integration
	};

	const handleGov1ItemChange = (itemKey: string, enabled: boolean) => {
		setGov1Items((prev) => {
			const currentItem = prev[itemKey as keyof typeof prev];
			const updatedNotifications: { [key: string]: boolean } = {};

			if (currentItem?.notifications && typeof currentItem.notifications === 'object') {
				Object.keys(currentItem.notifications).forEach((notifKey) => {
					updatedNotifications[notifKey] = enabled;
				});
			}

			return {
				...prev,
				[itemKey]: {
					...currentItem,
					enabled,
					notifications: updatedNotifications
				}
			};
		});
		console.log(itemKey, enabled);
		// TODO: Implement backend integration
	};

	const handleGov1NotificationChange = (itemKey: string, notificationKey: string, enabled: boolean) => {
		setGov1Items((prev) => {
			const currentItem = prev[itemKey as keyof typeof prev];
			const updatedNotifications = {
				...currentItem?.notifications,
				[notificationKey]: enabled
			};

			const hasNotifications = Object.keys(updatedNotifications).length > 0;
			const allNotificationsEnabled = hasNotifications ? Object.values(updatedNotifications).every((val) => val === true) : enabled;

			return {
				...prev,
				[itemKey]: {
					...currentItem,
					enabled: allNotificationsEnabled,
					notifications: updatedNotifications
				}
			};
		});
		console.log(itemKey, notificationKey, enabled);
		// TODO: Implement backend integration
	};

	const allOpenGovEnabled = Object.keys(trackLabels).every((key) => openGovTracks[key as keyof typeof openGovTracks]?.enabled === true);
	const allGov1Enabled = Object.keys(gov1Labels).every((key) => gov1Items[key as keyof typeof gov1Items]?.enabled === true);
	const allAdvancedEnabled = allOpenGovEnabled && allGov1Enabled;

	const toggleAllAdvanced = () => {
		const newState = !allAdvancedEnabled;

		const updatedOpenGovTracks = { ...openGovTracks };
		Object.keys(trackLabels).forEach((key) => {
			updatedOpenGovTracks[key as keyof typeof openGovTracks] = {
				enabled: newState,
				notifications: {
					newReferendumSubmitted: newState,
					referendumInVoting: newState,
					referendumClosed: newState
				}
			};
		});
		setOpenGovTracks(updatedOpenGovTracks);

		Object.keys(gov1Labels).forEach((key) => {
			handleGov1ItemChange(key, newState);
		});

		// TODO: Implement backend integration
	};

	return (
		<Collapsible className={classes.settingsCollapsible}>
			<CollapsibleTrigger className='w-full'>
				<div className={classes.collapsibleTrigger}>
					<div className='flex items-center gap-2'>
						<div className='flex items-center gap-2'>
							<Image
								src={AdvancedSettingsIcon}
								alt=''
								width={24}
								className='mt-1'
								height={24}
							/>
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.advancedSettings')}</h3>
							<div
								className='flex items-center gap-2'
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.stopPropagation();
									}
								}}
								role='button'
								tabIndex={0}
							>
								<Switch
									checked={allAdvancedEnabled}
									onCheckedChange={toggleAllAdvanced}
									className='h-4 w-8 border border-btn_secondary_text bg-transparent px-0.5 data-[state=checked]:bg-switch_inactive_bg data-[state=unchecked]:bg-transparent'
									thumbClassName='h-2 w-2 bg-btn_secondary_text'
								/>
								<span className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.all')}</span>
							</div>
						</div>
					</div>
					<ChevronDown className={classes.collapsibleTriggerIcon} />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator />
				<div className={classes.collapsibleContent}>
					<Tabs
						defaultValue='opengov'
						className='w-full'
					>
						<TabsList className='rounded-lg bg-call_args_bg px-2 py-1'>
							<TabsTrigger
								className='rounded-xl border-none bg-call_args_bg px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-bg_modal data-[state=active]:text-btn_secondary_text'
								value='opengov'
							>
								OpenGov
							</TabsTrigger>
							<TabsTrigger
								className='rounded-xl border-none bg-call_args_bg px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-bg_modal data-[state=active]:text-btn_secondary_text'
								value='gov1'
							>
								Gov1
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value='opengov'
							className='mt-4'
						>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='space-y-4'>
									{Object.entries(trackLabels)
										.slice(0, 8)
										.map(([key, { origin, label }]) => (
											<TrackItem
												key={key}
												icon={
													<Image
														src={getOriginIcon(origin)}
														alt={label}
														width={16}
														height={16}
														className='rounded'
													/>
												}
												title={label}
												enabled={openGovTracks[key as keyof typeof openGovTracks]?.enabled || false}
												notifications={
													openGovTracks[key as keyof typeof openGovTracks]?.notifications || {
														newReferendumSubmitted: false,
														referendumInVoting: false,
														referendumClosed: false
													}
												}
												onEnabledChange={(enabled) => handleOpenGovTrackChange(key, enabled)}
												onNotificationChange={(notificationKey, enabled) => handleOpenGovNotificationChange(key, notificationKey, enabled)}
											/>
										))}
								</div>

								<div className='space-y-4'>
									{Object.entries(trackLabels)
										.slice(8)
										.map(([key, { origin, label }]) => (
											<TrackItem
												key={key}
												icon={
													<Image
														src={getOriginIcon(origin)}
														alt={label}
														width={16}
														height={16}
														className='rounded'
													/>
												}
												title={label}
												enabled={openGovTracks[key as keyof typeof openGovTracks]?.enabled || false}
												notifications={
													openGovTracks[key as keyof typeof openGovTracks]?.notifications || {
														newReferendumSubmitted: false,
														referendumInVoting: false,
														referendumClosed: false
													}
												}
												onEnabledChange={(enabled) => handleOpenGovTrackChange(key, enabled)}
												onNotificationChange={(notificationKey, enabled) => handleOpenGovNotificationChange(key, notificationKey, enabled)}
											/>
										))}
								</div>
							</div>
						</TabsContent>

						<TabsContent
							value='gov1'
							className='mt-4'
						>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='space-y-4'>
									{Object.entries(gov1Labels)
										.slice(0, 5)
										.map(([key, { label }]) => (
											<Gov1Item
												key={key}
												icon={
													<Image
														src={getGov1Icon(key)}
														alt={label}
														width={16}
														height={16}
														className='rounded'
													/>
												}
												title={label}
												enabled={gov1Items[key as keyof typeof gov1Items]?.enabled || false}
												notifications={gov1Items[key as keyof typeof gov1Items]?.notifications || {}}
												notificationLabels={getGov1NotificationLabels(key, t)}
												onEnabledChange={(enabled) => handleGov1ItemChange(key, enabled)}
												onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange(key, notificationKey, enabled)}
												singleKey={key === 'mentionsIReceive'}
											/>
										))}
								</div>

								<div className='space-y-4'>
									{Object.entries(gov1Labels)
										.slice(5)
										.map(([key, { label }]) => (
											<Gov1Item
												key={key}
												icon={
													<Image
														src={getGov1Icon(key)}
														alt={label}
														width={16}
														height={16}
														className='rounded'
													/>
												}
												title={label}
												enabled={gov1Items[key as keyof typeof gov1Items]?.enabled || false}
												notifications={gov1Items[key as keyof typeof gov1Items]?.notifications || {}}
												notificationLabels={getGov1NotificationLabels(key, t)}
												onEnabledChange={(enabled) => handleGov1ItemChange(key, enabled)}
												onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange(key, notificationKey, enabled)}
												singleKey={key === 'mentionsIReceive'}
											/>
										))}
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default AdvancedSettingsSection;
