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
import { ENotificationChannel, ENetwork } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import CommentsIcon from '@assets/icons/notification-settings/comments.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

interface CommentsNotificationsSectionProps {
	network: ENetwork;
}

function CommentsNotificationsSection({ network }: CommentsNotificationsSectionProps) {
	const t = useTranslations();
	const { preferences, updateNetworkCommentsNotification, bulkUpdateNetworkCommentsNotifications } = useNotificationPreferences();

	const networkPreferences = preferences?.networkPreferences?.[network];

	const enabledChannels = preferences?.channelPreferences
		? Object.entries(preferences.channelPreferences)
				.filter(([, settings]) => settings.enabled && settings.verified)
				.reduce((acc, [channel]) => ({ ...acc, [channel]: true }), {})
		: {};

	const hasEnabledChannels = Object.keys(enabledChannels).length > 0;

	const commentsNotifications = networkPreferences?.commentsNotifications || {
		commentsOnMyProposals: { enabled: hasEnabledChannels, channels: enabledChannels },
		repliesToMyComments: { enabled: hasEnabledChannels, channels: enabledChannels },
		mentions: { enabled: hasEnabledChannels, channels: enabledChannels }
	};

	const handleCommentsNotificationChange = (type: string, enabled: boolean) => {
		const currentSettings = commentsNotifications[type as keyof typeof commentsNotifications];
		updateNetworkCommentsNotification(network, type, {
			...currentSettings,
			enabled
		});
	};

	const handleCommentsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		const currentSettings = commentsNotifications[type as keyof typeof commentsNotifications];
		updateNetworkCommentsNotification(network, type, {
			...currentSettings,
			channels: {
				...currentSettings?.channels,
				[channel]: enabled
			}
		});
	};

	const toggleAllComments = () => {
		const allEnabled = Object.values(commentsNotifications).every((item) => item?.enabled);
		const newState = !allEnabled;
		bulkUpdateNetworkCommentsNotifications(network, newState);
	};

	const allCommentsEnabled = Object.values(commentsNotifications).every((item) => item?.enabled);

	return (
		<Collapsible className={classes.settingsCollapsible}>
			<CollapsibleTrigger className='w-full'>
				<div className={classes.collapsibleTrigger}>
					<div className='flex items-center justify-between gap-2'>
						<div className='flex items-center gap-2'>
							<Image
								src={CommentsIcon}
								alt=''
								width={24}
								className='mt-1'
								height={24}
							/>
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.Notifications.comments')}</h3>
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
									checked={allCommentsEnabled}
									onCheckedChange={toggleAllComments}
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
							title={t('Profile.Settings.Notifications.commentsOnMyProposals')}
							description={t('Profile.Settings.Notifications.commentsOnMyProposalsDescription')}
							checked={commentsNotifications.commentsOnMyProposals?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange('commentsOnMyProposals', checked)}
							channels={commentsNotifications.commentsOnMyProposals?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange('commentsOnMyProposals', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.repliesToMyComments')}
							description={t('Profile.Settings.Notifications.repliesToMyCommentsDescription')}
							checked={commentsNotifications.repliesToMyComments?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange('repliesToMyComments', checked)}
							channels={commentsNotifications.repliesToMyComments?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange('repliesToMyComments', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.mentions')}
							description={t('Profile.Settings.Notifications.mentionsDescription')}
							checked={commentsNotifications.mentions?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange('mentions', checked)}
							channels={commentsNotifications.mentions?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange('mentions', channel, enabled)}
						/>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default CommentsNotificationsSection;
