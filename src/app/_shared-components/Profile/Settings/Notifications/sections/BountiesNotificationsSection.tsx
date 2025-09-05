// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import { ENotificationChannel, ENetwork, EBountiesNotification } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import BountiesIcon from '@assets/icons/notification-settings/Bounties.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

interface BountiesNotificationsSectionProps {
	network: ENetwork;
}

function BountiesNotificationsSection({ network }: BountiesNotificationsSectionProps) {
	const t = useTranslations();
	const { preferences, updateNetworkBountiesNotification, bulkUpdateNetworkBountiesNotifications } = useNotificationPreferences();

	const networkPreferences = preferences?.triggerPreferences?.[network];

	const enabledChannels = useMemo(() => {
		return preferences?.channelPreferences
			? Object.entries(preferences.channelPreferences)
					.filter(([, settings]) => settings.enabled && settings.verified)
					.reduce((acc, [channel]) => ({ ...acc, [channel]: true }), {})
			: {};
	}, [preferences?.channelPreferences]);

	const bountiesNotifications = useMemo(() => {
		if (networkPreferences?.bountiesNotifications) {
			return networkPreferences.bountiesNotifications;
		}

		return {
			bountyApplicationStatusUpdates: { enabled: false, channels: enabledChannels },
			bountyPayoutsAndMilestones: { enabled: false, channels: enabledChannels },
			activityOnBountiesIFollow: { enabled: false, channels: enabledChannels }
		};
	}, [networkPreferences?.bountiesNotifications, enabledChannels]);

	const handleBountiesNotificationChange = (type: string, enabled: boolean) => {
		const currentSettings = bountiesNotifications[type as keyof typeof bountiesNotifications];
		updateNetworkBountiesNotification(network, type, {
			...currentSettings,
			enabled
		});
	};

	const handleBountiesChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		const currentSettings = bountiesNotifications[type as keyof typeof bountiesNotifications];
		updateNetworkBountiesNotification(network, type, {
			...currentSettings,
			channels: {
				...currentSettings?.channels,
				[channel]: enabled
			}
		});
	};

	const toggleAllBounties = () => {
		const allEnabled = Object.values(bountiesNotifications).every((item) => item?.enabled);
		const newState = !allEnabled;
		bulkUpdateNetworkBountiesNotifications(network, newState);
	};

	const allBountiesEnabled = Object.values(bountiesNotifications).every((item) => item?.enabled);

	return (
		<Collapsible className={classes.settingsCollapsible}>
			<CollapsibleTrigger className='w-full'>
				<div className={classes.collapsibleTrigger}>
					<div className='flex items-center justify-between gap-2'>
						<div className='flex items-center gap-2'>
							<Image
								src={BountiesIcon}
								alt=''
								width={24}
								className='mt-1'
								height={24}
							/>
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.Notifications.bounties')}</h3>
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
									checked={allBountiesEnabled}
									onCheckedChange={toggleAllBounties}
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
					<div className='space-y-4'>
						<div className='space-y-2'>
							<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.chooseNotificationType')}</p>
							<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.wantMoreControl')}</p>
						</div>

						<NotificationItem
							title={t('Profile.Settings.Notifications.bountyApplicationStatusUpdates')}
							description={t('Profile.Settings.Notifications.bountyApplicationStatusUpdatesDescription')}
							checked={bountiesNotifications.bountyApplicationStatusUpdates?.enabled || false}
							onCheckedChange={(checked) => handleBountiesNotificationChange(EBountiesNotification.BOUNTY_APPLICATION_STATUS_UPDATES, checked)}
							channels={bountiesNotifications.bountyApplicationStatusUpdates?.channels}
							onChannelChange={(channel, enabled) => handleBountiesChannelChange(EBountiesNotification.BOUNTY_APPLICATION_STATUS_UPDATES, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.bountyPayoutsAndMilestones')}
							description={t('Profile.Settings.Notifications.bountyPayoutsAndMilestonesDescription')}
							checked={bountiesNotifications.bountyPayoutsAndMilestones?.enabled || false}
							onCheckedChange={(checked) => handleBountiesNotificationChange(EBountiesNotification.BOUNTY_PAYOUTS_AND_MILESTONES, checked)}
							channels={bountiesNotifications.bountyPayoutsAndMilestones?.channels}
							onChannelChange={(channel, enabled) => handleBountiesChannelChange(EBountiesNotification.BOUNTY_PAYOUTS_AND_MILESTONES, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.activityOnBountiesIFollow')}
							description={t('Profile.Settings.Notifications.activityOnBountiesIFollowDescription')}
							checked={bountiesNotifications.activityOnBountiesIFollow?.enabled || false}
							onCheckedChange={(checked) => handleBountiesNotificationChange(EBountiesNotification.ACTIVITY_ON_BOUNTIES_I_FOLLOW, checked)}
							channels={bountiesNotifications.activityOnBountiesIFollow?.channels}
							onChannelChange={(channel, enabled) => handleBountiesChannelChange(EBountiesNotification.ACTIVITY_ON_BOUNTIES_I_FOLLOW, channel, enabled)}
						/>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default BountiesNotificationsSection;
