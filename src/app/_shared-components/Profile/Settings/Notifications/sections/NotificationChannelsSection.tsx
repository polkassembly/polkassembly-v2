// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Mail, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { ENotificationChannel } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import NotificationChannelsIcon from '@assets/icons/notification-settings/notificationchannel.svg';
import EmailNotificationCard from '../components/EmailNotificationCard';
import BotSetupCard from '../components/BotSetupCard';
import { TelegramIcon, DiscordIcon, SlackIcon, ElementIcon } from '../components/Icons';
import TelegramInfoModal from '../Modals/Telegram';
import DiscordInfoModal from '../Modals/Discord';
import SlackInfoModal from '../Modals/Slack';
import classes from '../Notifications.module.scss';

const getBots = () => [
	{
		Icon: TelegramIcon,
		channel: ENotificationChannel.TELEGRAM,
		description: 'ADD THE POLKASSEMBLY BOT to a Telegram chat to get Telegram notifications',
		title: 'Telegram Notifications'
	},
	{
		Icon: DiscordIcon,
		channel: ENotificationChannel.DISCORD,
		description: 'ADD THE POLKASSEMBLY BOT to a Discord Channel chat to get Discord notifications',
		title: 'Discord Notifications'
	},
	{
		Icon: SlackIcon,
		channel: ENotificationChannel.SLACK,
		description: 'ADD THE POLKASSEMBLY BOT to a Slack Channel chat to get Slack notifications',
		title: 'Slack Notifications'
	},
	{
		Icon: ElementIcon,
		channel: ENotificationChannel.ELEMENT,
		description: 'Coming Soon',
		title: 'Element Notifications'
	}
];

function NotificationChannelsSection() {
	const t = useTranslations();
	const { user } = useUser();
	const { preferences, updateChannelPreference, generateToken } = useNotificationPreferences();
	const [showModal, setShowModal] = useState<ENotificationChannel | null>(null);

	const botsArr = getBots();

	const handleClick = (channel: ENotificationChannel) => {
		setShowModal(channel);
	};

	const getVerifyToken = async (channel: ENotificationChannel) => {
		return generateToken(channel);
	};

	const handleEmailNotificationToggle = (channel: ENotificationChannel, enabled: boolean) => {
		updateChannelPreference(channel, { enabled });
	};

	const channelPreferences = preferences?.channelPreferences || {
		[ENotificationChannel.EMAIL]: { enabled: false },
		[ENotificationChannel.TELEGRAM]: { enabled: false },
		[ENotificationChannel.DISCORD]: { enabled: false },
		[ENotificationChannel.SLACK]: { enabled: false },
		[ENotificationChannel.ELEMENT]: { enabled: false }
	};

	return (
		<>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<div className='flex items-center justify-between gap-2'>
							<div className='flex items-center gap-2'>
								<Image
									src={NotificationChannelsIcon}
									alt=''
									width={24}
									className='mt-1'
									height={24}
								/>
								<h3 className='mb-0 pt-1 text-base font-semibold leading-5 tracking-wide text-btn_secondary_text md:text-lg'>{t('Profile.Settings.notificationChannels')}</h3>
							</div>
						</div>
						<div className='flex items-center gap-4'>
							<div className='hidden items-center gap-4 md:flex'>
								<div className={`${!channelPreferences?.[ENotificationChannel.EMAIL]?.enabled ? 'opacity-50' : ''}`}>
									<Mail className='text-2xl text-text_primary' />
								</div>
								{botsArr.map((bot) => (
									<div
										className={`${!channelPreferences?.[bot.channel]?.enabled ? 'opacity-50' : ''}`}
										key={bot.channel}
									>
										<bot.Icon
											width={20}
											height={20}
											className='text-text_primary'
										/>
									</div>
								))}
							</div>
							<ChevronDown className={classes.collapsibleTriggerIcon} />
						</div>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<div className='flex flex-col'>
							<p className='mb-3 text-sm font-medium leading-5 text-btn_secondary_text sm:mb-6 sm:text-base'>{t('Profile.Settings.configureNotificationChannels')}</p>

							<EmailNotificationCard
								verifiedEmail={channelPreferences?.[ENotificationChannel.EMAIL]?.handle || user?.email || ''}
								verified={user?.isEmailVerified || false}
								enabled={channelPreferences?.[ENotificationChannel.EMAIL]?.enabled || false}
								handleEnableDisabled={handleEmailNotificationToggle}
							/>

							<Separator className='my-5' />
							{botsArr.map((bot, i) => (
								<div key={bot.title}>
									<BotSetupCard
										{...bot}
										onClick={handleClick}
									/>
									{botsArr.length - 1 > i && <Separator className='my-5' />}
								</div>
							))}
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Modals */}
			<TelegramInfoModal
				Icon={TelegramIcon}
				title='How to add Bot to Telegram'
				open={showModal === ENotificationChannel.TELEGRAM}
				getVerifyToken={getVerifyToken}
				onClose={() => setShowModal(null)}
				generatedToken={channelPreferences?.[ENotificationChannel.TELEGRAM]?.verification_token || ''}
			/>
			<DiscordInfoModal
				icon={
					<DiscordIcon
						width={20}
						height={20}
						className='text-text_primary'
					/>
				}
				title='How to add Bot to Discord'
				open={showModal === ENotificationChannel.DISCORD}
				getVerifyToken={getVerifyToken}
				onClose={() => setShowModal(null)}
				generatedToken={channelPreferences?.[ENotificationChannel.DISCORD]?.verification_token || ''}
			/>
			<SlackInfoModal
				icon={
					<SlackIcon
						width={20}
						height={20}
						className='text-text_primary'
					/>
				}
				title='How to add Bot to Slack'
				open={showModal === ENotificationChannel.SLACK}
				getVerifyToken={getVerifyToken}
				onClose={() => setShowModal(null)}
				generatedToken={channelPreferences?.[ENotificationChannel.SLACK]?.verification_token || ''}
			/>
		</>
	);
}

export default NotificationChannelsSection;
