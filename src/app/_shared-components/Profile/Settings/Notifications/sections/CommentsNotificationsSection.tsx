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
import { ENotificationChannel, ENetwork, ECommentsNotification } from '@/_shared/types';
import CommentsIcon from '@assets/icons/notification-settings/comments.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

interface CommentsNotificationsSectionProps {
	network: ENetwork;
}

function CommentsNotificationsSection({ network }: CommentsNotificationsSectionProps) {
	console.log('current network', network);
	const t = useTranslations();

	const [enabledChannels] = useState({
		[ENotificationChannel.EMAIL]: false,
		[ENotificationChannel.TELEGRAM]: false,
		[ENotificationChannel.DISCORD]: false,
		[ENotificationChannel.ELEMENT]: false,
		[ENotificationChannel.SLACK]: false,
		[ENotificationChannel.IN_APP]: false
	});

	const [commentsNotifications, setCommentsNotifications] = useState({
		commentsOnMyProposals: { enabled: false, channels: enabledChannels },
		repliesToMyComments: { enabled: false, channels: enabledChannels },
		mentions: { enabled: false, channels: enabledChannels }
	});

	const handleCommentsNotificationChange = (type: string, enabled: boolean) => {
		setCommentsNotifications((prev) => ({
			...prev,
			[type]: {
				...prev[type as keyof typeof prev],
				enabled,
				channels: enabled ? prev[type as keyof typeof prev]?.channels || enabledChannels : enabledChannels
			}
		}));
		console.log(type, enabled);
		// TODO: Implement backend integration
	};

	const handleCommentsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		setCommentsNotifications((prev) => {
			const updatedChannels = {
				...prev[type as keyof typeof prev]?.channels,
				[channel]: enabled
			};

			const anyChannelEnabled = Object.values(updatedChannels).some((channelEnabled) => channelEnabled);

			return {
				...prev,
				[type]: {
					...prev[type as keyof typeof prev],
					enabled: anyChannelEnabled,
					channels: updatedChannels
				}
			};
		});
		console.log(type, channel, enabled);
		// TODO: Implement backend integration
	};

	const toggleAllComments = () => {
		const allEnabled = Object.values(commentsNotifications).every((item) => item?.enabled);
		const newState = !allEnabled;
		setCommentsNotifications((prev) => {
			const updated = { ...prev };
			Object.keys(updated).forEach((key) => {
				updated[key as keyof typeof updated] = {
					...updated[key as keyof typeof updated],
					enabled: newState
				};
			});
			return updated;
		});
		console.log('Toggle all comments:', newState);
		// TODO: Implement backend integration
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
					<div className='space-y-4'>
						<div className='space-y-2'>
							<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.chooseNotificationType')}</p>
							<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.wantMoreControl')}</p>
						</div>

						<NotificationItem
							title={t('Profile.Settings.Notifications.commentsOnMyProposals')}
							description={t('Profile.Settings.Notifications.commentsOnMyProposalsDescription')}
							checked={commentsNotifications.commentsOnMyProposals?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange(ECommentsNotification.COMMENTS_ON_MY_PROPOSALS, checked)}
							channels={commentsNotifications.commentsOnMyProposals?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange(ECommentsNotification.COMMENTS_ON_MY_PROPOSALS, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.repliesToMyComments')}
							description={t('Profile.Settings.Notifications.repliesToMyCommentsDescription')}
							checked={commentsNotifications.repliesToMyComments?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange(ECommentsNotification.REPLIES_TO_MY_COMMENTS, checked)}
							channels={commentsNotifications.repliesToMyComments?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange(ECommentsNotification.REPLIES_TO_MY_COMMENTS, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.mentions')}
							description={t('Profile.Settings.Notifications.mentionsDescription')}
							checked={commentsNotifications.mentions?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange(ECommentsNotification.MENTIONS, checked)}
							channels={commentsNotifications.mentions?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange(ECommentsNotification.MENTIONS, channel, enabled)}
						/>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default CommentsNotificationsSection;
