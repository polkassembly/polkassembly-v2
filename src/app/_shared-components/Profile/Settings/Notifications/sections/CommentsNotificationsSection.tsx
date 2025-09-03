// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import { ENotificationChannel } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import CommentsIcon from '@assets/icons/comments.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

function CommentsNotificationsSection() {
	const { preferences, updateCommentsNotification, bulkUpdateCommentsNotifications } = useNotificationPreferences();

	const commentsNotifications = preferences?.commentsNotifications || {
		commentsOnMyProposals: { enabled: false, channels: {} },
		repliesToMyComments: { enabled: false, channels: {} },
		mentions: { enabled: false, channels: {} }
	};

	const handleCommentsNotificationChange = (type: string, enabled: boolean) => {
		const currentSettings = commentsNotifications[type as keyof typeof commentsNotifications];
		updateCommentsNotification(type, {
			...currentSettings,
			enabled
		});
	};

	const handleCommentsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		const currentSettings = commentsNotifications[type as keyof typeof commentsNotifications];
		updateCommentsNotification(type, {
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
		bulkUpdateCommentsNotifications(newState);
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
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>Comments</h3>
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
					<div className='space-y-4'>
						<div className='space-y-2'>
							<p className='text-text_secondary text-sm'>Choose the type of notifications you&apos;d like to receive.</p>
							<p className='text-text_secondary text-sm'>Want more control? Head to Advanced Settings to select specific apps and fine-tune your preferences.</p>
						</div>

						<NotificationItem
							title='Comments on my proposals'
							description='Get notified when someone comments on my proposals.'
							checked={commentsNotifications.commentsOnMyProposals?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange('commentsOnMyProposals', checked)}
							channels={commentsNotifications.commentsOnMyProposals?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange('commentsOnMyProposals', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Replies to my comments'
							description='Get notified when someone replies to your comments.'
							checked={commentsNotifications.repliesToMyComments?.enabled || false}
							onCheckedChange={(checked) => handleCommentsNotificationChange('repliesToMyComments', checked)}
							channels={commentsNotifications.repliesToMyComments?.channels}
							onChannelChange={(channel, enabled) => handleCommentsChannelChange('repliesToMyComments', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Mentions (@username)'
							description='Get notified when someone mentions you.'
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
