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
import PostIcon from '@assets/icons/posts.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

function PostsNotificationsSection() {
	const { preferences, updatePostsNotification, bulkUpdatePostsNotifications } = useNotificationPreferences();

	const postsNotifications = preferences?.postsNotifications || {
		proposalStatusChanges: { enabled: false, channels: {} },
		newProposalsInCategories: { enabled: false, channels: {} },
		votingDeadlineReminders: { enabled: false, channels: {} },
		updatesOnFollowedProposals: { enabled: false, channels: {} },
		proposalOutcomePublished: { enabled: false, channels: {} },
		proposalsYouVotedOnEnacted: { enabled: false, channels: {} }
	};

	const handlePostsNotificationChange = (type: string, enabled: boolean) => {
		const currentSettings = postsNotifications[type as keyof typeof postsNotifications];
		updatePostsNotification(type, {
			...currentSettings,
			enabled
		});
	};

	const handlePostsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		const currentSettings = postsNotifications[type as keyof typeof postsNotifications];
		updatePostsNotification(type, {
			...currentSettings,
			channels: {
				...currentSettings?.channels,
				[channel]: enabled
			}
		});
	};

	const toggleAllPosts = () => {
		const allEnabled = Object.values(postsNotifications).every((item) => item?.enabled);
		const newState = !allEnabled;
		bulkUpdatePostsNotifications(newState);
	};

	const allPostsEnabled = Object.values(postsNotifications).every((item) => item?.enabled);

	return (
		<Collapsible className={classes.settingsCollapsible}>
			<CollapsibleTrigger className='w-full'>
				<div className={classes.collapsibleTrigger}>
					<div className='flex items-center justify-between gap-2'>
						<div className='flex items-center gap-2'>
							<Image
								src={PostIcon}
								alt=''
								width={24}
								className='mt-1'
								height={24}
							/>
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>Posts</h3>
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
									checked={allPostsEnabled}
									onCheckedChange={toggleAllPosts}
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
							title='My Proposal Status Changes'
							description='Updates on approval, rejection, review, or final enactment of your proposals.'
							checked={postsNotifications.proposalStatusChanges?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('proposalStatusChanges', checked)}
							channels={postsNotifications.proposalStatusChanges?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('proposalStatusChanges', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='New Proposals in Tracked Categories'
							description='Be the first to know when new proposals go live in categories you follow.'
							checked={postsNotifications.newProposalsInCategories?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('newProposalsInCategories', checked)}
							channels={postsNotifications.newProposalsInCategories?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('newProposalsInCategories', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Voting Deadline Reminders'
							description='Alerts to vote before referenda close. Choose when to be reminded.'
							checked={postsNotifications.votingDeadlineReminders?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('votingDeadlineReminders', checked)}
							channels={postsNotifications.votingDeadlineReminders?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('votingDeadlineReminders', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Updates on Followed Proposals'
							description='Changes, comments, or status updates on proposals you follow.'
							checked={postsNotifications.updatesOnFollowedProposals?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('updatesOnFollowedProposals', checked)}
							channels={postsNotifications.updatesOnFollowedProposals?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('updatesOnFollowedProposals', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Proposal Outcome Published'
							description='Get the final results after voting ends.'
							checked={postsNotifications.proposalOutcomePublished?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('proposalOutcomePublished', checked)}
							channels={postsNotifications.proposalOutcomePublished?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('proposalOutcomePublished', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title='Proposals You Voted On — Enacted'
							description='Know when a proposal you supported is implemented.'
							checked={postsNotifications.proposalsYouVotedOnEnacted?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('proposalsYouVotedOnEnacted', checked)}
							channels={postsNotifications.proposalsYouVotedOnEnacted?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('proposalsYouVotedOnEnacted', channel, enabled)}
						/>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default PostsNotificationsSection;
