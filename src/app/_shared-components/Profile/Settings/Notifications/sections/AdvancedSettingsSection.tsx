// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { ENetwork } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import AdvancedSettingsIcon from '@assets/icons/notification-settings/advancedsettings.svg';
import TrackItem from '../components/TrackItem';
import Gov1Item from '../components/Gov1Item';
import classes from '../Notifications.module.scss';

const trackLabels = {
	root: 'Root',
	stakingAdmin: 'Staking Admin',
	auctionAdmin: 'Auction Admin',
	treasurer: 'Treasurer',
	referendumCanceller: 'Referendum Canceller',
	referendumKiller: 'Referendum Killer',
	leaseAdmin: 'Lease Admin',
	memberReferenda: 'Member Referenda',
	smallTipper: 'Small Tipper',
	bigTipper: 'Big Tipper',
	smallSpender: 'Small Spender',
	mediumSpender: 'Medium Spender',
	bigSpender: 'Big Spender',
	fellowshipAdmin: 'Fellowship Admin',
	generalAdmin: 'General Admin',
	whitelistedCaller: 'Whitelisted Caller'
};

const gov1Labels = {
	mentionsIReceive: 'Mentions I receive',
	referendums: 'Referendums',
	proposals: 'Proposals',
	bounties: 'Bounties',
	childBounties: 'Child Bounties',
	tips: 'Tips',
	techCommittee: 'Tech Committee',
	councilMotion: 'Council Motion'
};

interface AdvancedSettingsSectionProps {
	network: ENetwork;
}

function AdvancedSettingsSection({ network }: AdvancedSettingsSectionProps) {
	const t = useTranslations();
	const { preferences, updateNetworkOpenGovTrack, updateNetworkGov1Item, bulkUpdateNetworkAdvancedSettings, bulkUpdateNetworkTrackNotifications } = useNotificationPreferences();

	const networkPreferences = preferences?.networkPreferences?.[network];
	const openGovTracks = networkPreferences?.openGovTracks || {};
	const gov1Items = networkPreferences?.gov1Items || {};

	const handleOpenGovTrackChange = (trackKey: string, enabled: boolean) => {
		bulkUpdateNetworkTrackNotifications(network, trackKey, enabled, 'opengov');
	};

	const handleOpenGovNotificationChange = (trackKey: string, notificationKey: string, enabled: boolean) => {
		const currentSettings = openGovTracks[trackKey];
		updateNetworkOpenGovTrack(network, trackKey, {
			...currentSettings,
			notifications: {
				...currentSettings?.notifications,
				[notificationKey]: enabled
			}
		});
	};

	const handleGov1ItemChange = (itemKey: string, enabled: boolean) => {
		bulkUpdateNetworkTrackNotifications(network, itemKey, enabled, 'gov1');
	};

	const handleGov1NotificationChange = (itemKey: string, notificationKey: string, enabled: boolean) => {
		const currentSettings = gov1Items[itemKey];
		updateNetworkGov1Item(network, itemKey, {
			...currentSettings,
			notifications: {
				...currentSettings?.notifications,
				[notificationKey]: enabled
			}
		});
	};

	const allOpenGovEnabled = Object.keys(trackLabels).every((key) => openGovTracks[key]?.enabled === true);
	const allGov1Enabled = Object.keys(gov1Labels).every((key) => gov1Items[key]?.enabled === true);
	const allAdvancedEnabled = allOpenGovEnabled && allGov1Enabled;

	const toggleAllAdvanced = () => {
		const newState = !allAdvancedEnabled;
		bulkUpdateNetworkAdvancedSettings(network, newState);
	};

	return (
		<Collapsible className={classes.settingsCollapsible}>
			<CollapsibleTrigger className='w-full'>
				<div className={classes.collapsibleTrigger}>
					<div className='flex items-center justify-between gap-2'>
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
								<span className='text-text_secondary text-sm'>All</span>
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
						<TabsList className='rounded-lg bg-[#F5F6F8] px-2 py-1'>
							<TabsTrigger
								className='rounded-xl border-none bg-[#F5F6F8] px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-white data-[state=active]:text-btn_secondary_text'
								value='opengov'
							>
								OpenGov
							</TabsTrigger>
							<TabsTrigger
								className='rounded-xl border-none bg-[#F5F6F8] px-6 py-1 text-wallet_btn_text/70 data-[state=active]:bg-white data-[state=active]:text-btn_secondary_text'
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
										.map(([key, label], index) => (
											<TrackItem
												key={key}
												icon={<div className={`h-4 w-4 rounded bg-${['blue', 'green', 'purple', 'yellow', 'red', 'gray', 'indigo', 'pink'][index]}-500`} />}
												title={label}
												enabled={openGovTracks[key]?.enabled || false}
												notifications={
													openGovTracks[key]?.notifications || {
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
										.map(([key, label], index) => (
											<TrackItem
												key={key}
												icon={<div className={`h-4 w-4 rounded bg-${['cyan', 'orange', 'teal', 'lime', 'emerald', 'violet', 'rose', 'slate'][index]}-500`} />}
												title={label}
												enabled={openGovTracks[key]?.enabled || false}
												notifications={
													openGovTracks[key]?.notifications || {
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
									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-purple-500' />}
										title={gov1Labels.mentionsIReceive}
										enabled={gov1Items.mentionsIReceive?.enabled || false}
										onEnabledChange={(enabled) => handleGov1ItemChange('mentionsIReceive', enabled)}
										isSimple
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-blue-500' />}
										title={gov1Labels.referendums}
										enabled={gov1Items.referendums?.enabled || false}
										notifications={gov1Items.referendums?.notifications || {}}
										notificationLabels={{
											newReferendumSubmitted: 'New Referendum submitted',
											referendumInVoting: 'Referendum in voting',
											referendumClosed: 'Referendum closed'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('referendums', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('referendums', notificationKey, enabled)}
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-green-500' />}
										title={gov1Labels.bounties}
										enabled={gov1Items.bounties?.enabled || false}
										notifications={gov1Items.bounties?.notifications || {}}
										notificationLabels={{
											bountiesSubmitted: 'Bounties submitted',
											bountiesClosed: 'Bounties closed'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('bounties', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('bounties', notificationKey, enabled)}
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-yellow-500' />}
										title={gov1Labels.tips}
										enabled={gov1Items.tips?.enabled || false}
										notifications={gov1Items.tips?.notifications || {}}
										notificationLabels={{
											newTipsSubmitted: 'New Tips submitted',
											tipsOpened: 'Tips opened',
											tipsClosed: 'Tips closed / retracted'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('tips', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('tips', notificationKey, enabled)}
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-red-500' />}
										title={gov1Labels.councilMotion}
										enabled={gov1Items.councilMotion?.enabled || false}
										notifications={gov1Items.councilMotion?.notifications || {}}
										notificationLabels={{
											newMotionsSubmitted: 'New Motions submitted',
											motionInVoting: 'Motion in voting',
											motionClosed: 'Motion closed / retracted'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('councilMotion', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('councilMotion', notificationKey, enabled)}
									/>
								</div>

								<div className='space-y-4'>
									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-indigo-500' />}
										title={gov1Labels.proposals}
										enabled={gov1Items.proposals?.enabled || false}
										notifications={gov1Items.proposals?.notifications || {}}
										notificationLabels={{
											newProposalsSubmitted: 'New Proposals submitted',
											proposalInVoting: 'Proposal in voting',
											proposalClosed: 'Proposal closed'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('proposals', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('proposals', notificationKey, enabled)}
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-teal-500' />}
										title={gov1Labels.childBounties}
										enabled={gov1Items.childBounties?.enabled || false}
										notifications={gov1Items.childBounties?.notifications || {}}
										notificationLabels={{
											childBountiesSubmitted: 'Child Bounties submitted',
											childBountiesClosed: 'Child Bounties closed'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('childBounties', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('childBounties', notificationKey, enabled)}
									/>

									<Gov1Item
										icon={<div className='h-4 w-4 rounded bg-gray-500' />}
										title={gov1Labels.techCommittee}
										enabled={gov1Items.techCommittee?.enabled || false}
										notifications={gov1Items.techCommittee?.notifications || {}}
										notificationLabels={{
											newTechCommitteeProposalsSubmitted: 'New Tech Committee Proposals submitted',
											proposalsClosed: 'Proposals closed'
										}}
										onEnabledChange={(enabled) => handleGov1ItemChange('techCommittee', enabled)}
										onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('techCommittee', notificationKey, enabled)}
									/>
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
