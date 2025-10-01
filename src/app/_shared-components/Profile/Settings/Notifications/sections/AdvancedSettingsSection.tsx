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
import {
	defaultBountyNotifications,
	defaultChildBountyNotifications,
	defaultCouncilMotionNotifications,
	defaultDemocracyProposalNotifications,
	defaultReferendumNotifications,
	defaultTechCommitteeNotifications,
	defaultTipNotifications,
	getGov1Icon,
	getGov1Labels,
	getGov1NotificationLabels,
	getOriginIcon,
	getTrackLabels
} from '@/_shared/_constants/NotificationConstants';
import TrackItem from '../components/TrackItem';
import Gov1Item from '../components/Gov1Item';
import classes from '../Notifications.module.scss';

interface AdvancedSettingsSectionProps {
	network: ENetwork;
}

function AdvancedSettingsSection({ network }: AdvancedSettingsSectionProps) {
	const openGovTracksList = [
		EPostOrigin.ROOT,
		EPostOrigin.STAKING_ADMIN,
		EPostOrigin.AUCTION_ADMIN,
		EPostOrigin.TREASURER,
		EPostOrigin.MEMBERS,
		EPostOrigin.REFERENDUM_KILLER,
		EPostOrigin.LEASE_ADMIN,
		EPostOrigin.REFERENDUM_CANCELLER,
		EPostOrigin.SMALL_TIPPER,
		EPostOrigin.BIG_TIPPER,
		EPostOrigin.SMALL_SPENDER,
		EPostOrigin.MEDIUM_SPENDER,
		EPostOrigin.BIG_SPENDER,
		EPostOrigin.FELLOWSHIP_ADMIN,
		EPostOrigin.GENERAL_ADMIN,
		EPostOrigin.WHITELISTED_CALLER
	];
	const gov1ProposalsList = {
		mentionsIReceive: {},
		[EProposalType.REFERENDUM]: defaultReferendumNotifications,
		[EProposalType.BOUNTY]: defaultBountyNotifications,
		[EProposalType.TIP]: defaultTipNotifications,
		[EProposalType.COUNCIL_MOTION]: defaultCouncilMotionNotifications,
		[EProposalType.DEMOCRACY_PROPOSAL]: defaultDemocracyProposalNotifications,
		[EProposalType.CHILD_BOUNTY]: defaultChildBountyNotifications,
		[EProposalType.TECHNICAL_COMMITTEE]: defaultTechCommitteeNotifications
	};
	const createOpenGovDefaults = () => Object.fromEntries(openGovTracksList.map((track) => [track, { enabled: false, notifications: { ...defaultReferendumNotifications } }]));

	const createGov1Defaults = () =>
		Object.fromEntries(Object.entries(gov1ProposalsList).map(([key, notifications]) => [key, { enabled: false, notifications: { ...notifications } }]));

	const [openGovTracks, setOpenGovTracks] = useState(createOpenGovDefaults);
	const [gov1Items, setGov1Items] = useState(createGov1Defaults);

	const t = useTranslations();
	console.log('current network', network);

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
							className='mt-6'
						>
							<div className='overflow-hidden rounded-lg border border-border_grey'>
								<div className='grid grid-cols-1 md:grid-cols-2'>
									<div className='border-border_grey md:border-r md:border-dashed'>
										{Object.entries(trackLabels)
											.slice(0, 8)
											.map(([key, { origin, label }], index, arr) => (
												<div
													key={key}
													className={`p-4 ${index < arr.length - 1 ? 'border-b border-dashed border-border_grey md:text-left' : ''}`}
												>
													<TrackItem
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
												</div>
											))}
									</div>

									<div>
										{Object.entries(trackLabels)
											.slice(8)
											.map(([key, { origin, label }], index, arr) => (
												<div
													key={key}
													className={`p-4 ${index < arr.length - 1 ? 'border-b border-dashed border-border_grey text-left' : ''}`}
												>
													<TrackItem
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
												</div>
											))}
									</div>
								</div>
							</div>
						</TabsContent>
						<TabsContent
							value='gov1'
							className='mt-6'
						>
							<div className='mb-4'>
								<Gov1Item
									icon={
										<Image
											src={getGov1Icon('mentionsIReceive')}
											alt={gov1Labels.mentionsIReceive.label}
											width={16}
											height={16}
											className='rounded'
										/>
									}
									title={gov1Labels.mentionsIReceive.label}
									enabled={gov1Items.mentionsIReceive?.enabled || false}
									notifications={gov1Items.mentionsIReceive?.notifications || {}}
									notificationLabels={getGov1NotificationLabels('mentionsIReceive', t)}
									onEnabledChange={(enabled) => handleGov1ItemChange('mentionsIReceive', enabled)}
									onNotificationChange={(notificationKey, enabled) => handleGov1NotificationChange('mentionsIReceive', notificationKey, enabled)}
									singleKey
								/>
							</div>

							<div className='overflow-hidden rounded-lg border border-border_grey'>
								<div className='grid grid-cols-1 md:grid-cols-2'>
									<div className='border-border_grey md:border-r md:border-dashed'>
										{Object.entries(gov1Labels)
											.filter(([key]) => key !== 'mentionsIReceive')
											.slice(0, 4)
											.map(([key, { label }], index, arr) => (
												<div
													key={key}
													className={`p-4 ${index < arr.length - 1 ? 'border-b border-dashed border-border_grey' : ''}`}
												>
													<Gov1Item
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
														singleKey={false}
													/>
												</div>
											))}
									</div>

									<div>
										{Object.entries(gov1Labels)
											.filter(([key]) => key !== 'mentionsIReceive')
											.slice(4)
											.map(([key, { label }], index, arr) => (
												<div
													key={key}
													className={`p-4 ${index < arr.length - 1 ? 'border-b border-dashed border-border_grey' : ''}`}
												>
													<Gov1Item
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
														singleKey={false}
													/>
												</div>
											))}
									</div>
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
