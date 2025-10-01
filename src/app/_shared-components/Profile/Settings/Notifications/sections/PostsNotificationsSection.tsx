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
import { ENotificationChannel, ENetwork, EPostsNotification } from '@/_shared/types';
import PostIcon from '@assets/icons/notification-settings/posts.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

interface PostsNotificationsSectionProps {
	network: ENetwork;
}

function PostsNotificationsSection({ network }: PostsNotificationsSectionProps) {
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

	const [postsNotifications, setPostsNotifications] = useState({
		proposalStatusChanges: { enabled: false, channels: enabledChannels },
		newProposalsInCategories: { enabled: false, channels: enabledChannels },
		votingDeadlineReminders: { enabled: false, channels: enabledChannels },
		updatesOnFollowedProposals: { enabled: false, channels: enabledChannels },
		proposalOutcomePublished: { enabled: false, channels: enabledChannels },
		proposalsYouVotedOnEnacted: { enabled: false, channels: enabledChannels }
	});

	const handlePostsNotificationChange = (type: string, enabled: boolean) => {
		setPostsNotifications((prev) => ({
			...prev,
			[type]: {
				...prev[type as keyof typeof prev],
				enabled
			}
		}));
		console.log(type, enabled);
		// TODO: Implement backend integration
	};

	const handlePostsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		setPostsNotifications((prev) => ({
			...prev,
			[type]: {
				...prev[type as keyof typeof prev],
				channels: {
					...prev[type as keyof typeof prev]?.channels,
					[channel]: enabled
				}
			}
		}));
		console.log(type, channel, enabled);
		// TODO: Implement backend integration
	};

	const toggleAllPosts = () => {
		const allEnabled = Object.values(postsNotifications).every((item) => item?.enabled);
		const newState = !allEnabled;
		setPostsNotifications((prev) => {
			const updated = { ...prev };
			Object.keys(updated).forEach((key) => {
				updated[key as keyof typeof updated] = {
					...updated[key as keyof typeof updated],
					enabled: newState
				};
			});
			return updated;
		});
		console.log('Toggle all posts:', newState);
		// TODO: Implement backend integration
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
							<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.Notifications.posts')}</h3>
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
							title={t('Profile.Settings.Notifications.myProposalStatusChanges')}
							description={t('Profile.Settings.Notifications.myProposalStatusChangesDescription')}
							checked={postsNotifications.proposalStatusChanges?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.PROPOSAL_STATUS_CHANGES, checked)}
							channels={postsNotifications.proposalStatusChanges?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.PROPOSAL_STATUS_CHANGES, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.newProposalsInCategories')}
							description={t('Profile.Settings.Notifications.newProposalsInCategoriesDescription')}
							checked={postsNotifications.newProposalsInCategories?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.NEW_PROPOSALS_IN_CATEGORIES, checked)}
							channels={postsNotifications.newProposalsInCategories?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.NEW_PROPOSALS_IN_CATEGORIES, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.votingDeadlineReminders')}
							description={t('Profile.Settings.Notifications.votingDeadlineRemindersDescription')}
							checked={postsNotifications.votingDeadlineReminders?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.VOTING_DEADLINE_REMINDERS, checked)}
							channels={postsNotifications.votingDeadlineReminders?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.VOTING_DEADLINE_REMINDERS, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.updatesOnFollowedProposals')}
							description={t('Profile.Settings.Notifications.updatesOnFollowedProposalsDescription')}
							checked={postsNotifications.updatesOnFollowedProposals?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.UPDATES_ON_FOLLOWED_PROPOSALS, checked)}
							channels={postsNotifications.updatesOnFollowedProposals?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.UPDATES_ON_FOLLOWED_PROPOSALS, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.proposalOutcomePublished')}
							description={t('Profile.Settings.Notifications.proposalOutcomePublishedDescription')}
							checked={postsNotifications.proposalOutcomePublished?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.PROPOSAL_OUTCOME_PUBLISHED, checked)}
							channels={postsNotifications.proposalOutcomePublished?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.PROPOSAL_OUTCOME_PUBLISHED, channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.proposalsYouVotedOnEnacted')}
							description={t('Profile.Settings.Notifications.proposalsYouVotedOnEnactedDescription')}
							checked={postsNotifications.proposalsYouVotedOnEnacted?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange(EPostsNotification.PROPOSALS_YOU_VOTED_ON_ENACTED, checked)}
							channels={postsNotifications.proposalsYouVotedOnEnacted?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange(EPostsNotification.PROPOSALS_YOU_VOTED_ON_ENACTED, channel, enabled)}
						/>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default PostsNotificationsSection;
