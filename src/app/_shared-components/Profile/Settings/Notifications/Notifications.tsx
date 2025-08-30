// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Separator } from '@/app/_shared-components/Separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
import { Bell, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import classes from './Notifications.module.scss';

function Notifications() {
	const t = useTranslations();

	return (
		<div className='flex flex-col gap-5'>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<Bell
								size={24}
								className='text-text_primary'
							/>
							{t('Profile.Settings.notificationChannels')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureNotificationChannels')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<span className='text-text_primary'>🔗</span>
							{t('Profile.Settings.parachains')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureParachainNotifications')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<span className='text-text_primary'>📋</span>
							{t('Profile.Settings.myProposals')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureProposalsNotifications')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<span className='text-text_primary'>📺</span>
							{t('Profile.Settings.subscribedPosts')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureSubscribedPostsNotifications')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<span className='text-text_primary'>🔔</span>
							{t('Profile.Settings.gov1Notifications')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureGov1Notifications')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>

			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<span className='text-text_primary'>🔔</span>
							{t('Profile.Settings.openGovNotifications')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<p className='text-sm text-text_primary'>{t('Profile.Settings.configureOpenGovNotifications')}</p>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

export default Notifications;
