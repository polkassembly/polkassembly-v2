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
import { ENotificationChannel, ENetwork } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import PostIcon from '@assets/icons/notification-settings/posts.svg';
import NotificationItem from '../components/NotificationItem';
import classes from '../Notifications.module.scss';

interface PostsNotificationsSectionProps {
	network: ENetwork;
}

function PostsNotificationsSection({ network }: PostsNotificationsSectionProps) {
	const t = useTranslations();
	const { preferences, updateNetworkPostsNotification, bulkUpdateNetworkPostsNotifications } = useNotificationPreferences();

	const networkPreferences = preferences?.triggerPreferences?.[network];

	const enabledChannels = useMemo(() => {
		return preferences?.channelPreferences
			? Object.entries(preferences.channelPreferences)
					.filter(([, settings]) => settings.enabled && settings.verified)
					.reduce((acc, [channel]) => ({ ...acc, [channel]: true }), {})
			: {};
	}, [preferences?.channelPreferences]);

	const postsNotifications = useMemo(() => {
		if (networkPreferences?.postsNotifications) {
			return networkPreferences.postsNotifications;
		}

		return {
			proposalStatusChanges: { enabled: false, channels: enabledChannels },
			newProposalsInCategories: { enabled: false, channels: enabledChannels },
			votingDeadlineReminders: { enabled: false, channels: enabledChannels },
			updatesOnFollowedProposals: { enabled: false, channels: enabledChannels },
			proposalOutcomePublished: { enabled: false, channels: enabledChannels },
			proposalsYouVotedOnEnacted: { enabled: false, channels: enabledChannels }
		};
	}, [networkPreferences?.postsNotifications, enabledChannels]);

	const handlePostsNotificationChange = (type: string, enabled: boolean) => {
		const currentSettings = postsNotifications[type as keyof typeof postsNotifications];
		updateNetworkPostsNotification(network, type, {
			...currentSettings,
			enabled
		});
	};

	const handlePostsChannelChange = (type: string, channel: ENotificationChannel, enabled: boolean) => {
		const currentSettings = postsNotifications[type as keyof typeof postsNotifications];
		updateNetworkPostsNotification(network, type, {
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
		bulkUpdateNetworkPostsNotifications(network, newState);
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
							onCheckedChange={(checked) => handlePostsNotificationChange('proposalStatusChanges', checked)}
							channels={postsNotifications.proposalStatusChanges?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('proposalStatusChanges', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.newProposalsInCategories')}
							description={t('Profile.Settings.Notifications.newProposalsInCategoriesDescription')}
							checked={postsNotifications.newProposalsInCategories?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('newProposalsInCategories', checked)}
							channels={postsNotifications.newProposalsInCategories?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('newProposalsInCategories', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.votingDeadlineReminders')}
							description={t('Profile.Settings.Notifications.votingDeadlineRemindersDescription')}
							checked={postsNotifications.votingDeadlineReminders?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('votingDeadlineReminders', checked)}
							channels={postsNotifications.votingDeadlineReminders?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('votingDeadlineReminders', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.updatesOnFollowedProposals')}
							description={t('Profile.Settings.Notifications.updatesOnFollowedProposalsDescription')}
							checked={postsNotifications.updatesOnFollowedProposals?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('updatesOnFollowedProposals', checked)}
							channels={postsNotifications.updatesOnFollowedProposals?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('updatesOnFollowedProposals', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.proposalOutcomePublished')}
							description={t('Profile.Settings.Notifications.proposalOutcomePublishedDescription')}
							checked={postsNotifications.proposalOutcomePublished?.enabled || false}
							onCheckedChange={(checked) => handlePostsNotificationChange('proposalOutcomePublished', checked)}
							channels={postsNotifications.proposalOutcomePublished?.channels}
							onChannelChange={(channel, enabled) => handlePostsChannelChange('proposalOutcomePublished', channel, enabled)}
						/>

						<Separator className='my-2' />

						<NotificationItem
							title={t('Profile.Settings.Notifications.proposalsYouVotedOnEnacted')}
							description={t('Profile.Settings.Notifications.proposalsYouVotedOnEnactedDescription')}
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
