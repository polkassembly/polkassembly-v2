// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
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
		case 'referendums':
			return DemocracyReferendaIcon;
		case 'proposals':
			return ProposalIcon;
		case 'bounties':
			return BountyIcon;
		case 'childBounties':
			return BountyIcon;
		case 'tips':
			return TipsIcon;
		case 'techCommittee':
			return TechCommProposalsIcon;
		case 'councilMotion':
			return CouncilMotionIcon;
		default:
			return AdministrationIcon;
	}
};

const getGov1NotificationLabels = (itemKey: string, t: (key: string) => string): { [key: string]: string } | undefined => {
	switch (itemKey) {
		case 'referendums':
			return {
				newReferendumSubmitted: t('Profile.Settings.Notifications.newReferendumSubmitted'),
				referendumInVoting: t('Profile.Settings.Notifications.referendumInVoting'),
				referendumClosed: t('Profile.Settings.Notifications.referendumClosed')
			};
		case 'proposals':
			return {
				newProposalsSubmitted: t('Profile.Settings.Notifications.newProposalsSubmitted'),
				proposalInVoting: t('Profile.Settings.Notifications.proposalInVoting'),
				proposalClosed: t('Profile.Settings.Notifications.proposalClosed')
			};
		case 'bounties':
			return {
				bountiesSubmitted: t('Profile.Settings.Notifications.bountiesSubmitted'),
				bountiesClosed: t('Profile.Settings.Notifications.bountiesClosed')
			};
		case 'childBounties':
			return {
				childBountiesSubmitted: t('Profile.Settings.Notifications.childBountiesSubmitted'),
				childBountiesClosed: t('Profile.Settings.Notifications.childBountiesClosed')
			};
		case 'tips':
			return {
				newTipsSubmitted: t('Profile.Settings.Notifications.newTipsSubmitted'),
				tipsOpened: t('Profile.Settings.Notifications.tipsOpened'),
				tipsClosed: t('Profile.Settings.Notifications.tipsClosed')
			};
		case 'techCommittee':
			return {
				newTechCommitteeProposalsSubmitted: t('Profile.Settings.Notifications.newTechCommitteeProposalsSubmitted'),
				proposalsClosed: t('Profile.Settings.Notifications.proposalsClosed')
			};
		case 'councilMotion':
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
	stakingAdmin: { origin: EPostOrigin.STAKING_ADMIN, label: t('Sidebar.StakingAdmin') },
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
	referendums: { label: t('Sidebar.referenda') },
	proposals: { label: t('Sidebar.proposals') },
	bounties: { label: t('Sidebar.bounty') },
	childBounties: { label: t('Sidebar.childBounties') },
	tips: { label: t('Sidebar.tips') },
	techCommittee: { label: t('Sidebar.techComm') },
	councilMotion: { label: t('Sidebar.motions') }
});

interface AdvancedSettingsSectionProps {
	network: ENetwork;
}

function AdvancedSettingsSection({ network }: AdvancedSettingsSectionProps) {
	const t = useTranslations();
	const { preferences, updateNetworkOpenGovTrack, updateNetworkGov1Item, bulkUpdateNetworkAdvancedSettings, bulkUpdateNetworkTrackNotifications } = useNotificationPreferences();

	const networkPreferences = preferences?.networkPreferences?.[network];
	const openGovTracks = networkPreferences?.openGovTracks || {};
	const gov1Items = networkPreferences?.gov1Items || {};

	const trackLabels = getTrackLabels(t);
	const gov1Labels = getGov1Labels(t);

	const handleOpenGovTrackChange = (trackKey: string, enabled: boolean) => {
		bulkUpdateNetworkTrackNotifications(network, trackKey, enabled, 'opengov');
	};

	const handleOpenGovNotificationChange = (trackKey: string, notificationKey: string, enabled: boolean) => {
		const current = openGovTracks[trackKey as keyof typeof openGovTracks] ?? { enabled: false, notifications: {} as Record<string, boolean> };
		updateNetworkOpenGovTrack(network, trackKey, {
			...current,
			enabled: current.enabled || enabled,
			notifications: {
				...(current.notifications ?? {}),
				[notificationKey]: enabled
			}
		});
	};

	const handleGov1ItemChange = (itemKey: string, enabled: boolean) => {
		bulkUpdateNetworkTrackNotifications(network, itemKey, enabled, 'gov1');
	};

	const handleGov1NotificationChange = (itemKey: string, notificationKey: string, enabled: boolean) => {
		const current = gov1Items[itemKey as keyof typeof gov1Items] ?? { enabled: false, notifications: {} as Record<string, boolean> };
		updateNetworkGov1Item(network, itemKey, {
			...current,
			enabled: current.enabled || enabled,
			notifications: {
				...(current.notifications ?? {}),
				[notificationKey]: enabled
			}
		});
	};

	const allOpenGovEnabled = Object.keys(trackLabels).every((key) => openGovTracks[key as keyof typeof openGovTracks]?.enabled === true);
	const allGov1Enabled = Object.keys(gov1Labels).every((key) => gov1Items[key as keyof typeof gov1Items]?.enabled === true);
	const allAdvancedEnabled = allOpenGovEnabled && allGov1Enabled;

	const toggleAllAdvanced = () => {
		const newState = !allAdvancedEnabled;
		bulkUpdateNetworkAdvancedSettings(network, newState);
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
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.advancedsettings')}</h3>
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
								className='rounded-xl border-none bg-call_args_bg px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-white data-[state=active]:text-btn_secondary_text'
								value='opengov'
							>
								OpenGov
							</TabsTrigger>
							<TabsTrigger
								className='rounded-xl border-none bg-call_args_bg px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-white data-[state=active]:text-btn_secondary_text'
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
												isSimple={key === 'mentionsIReceive'}
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
												isSimple={key === 'mentionsIReceive'}
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
