// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { ChevronDown, Mail } from 'lucide-react';
import { ENotificationChannel } from '@/_shared/types';
import { TelegramIcon, DiscordIcon, SlackIcon, ElementIcon } from './Icons';

interface NotificationItemProps {
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	channels?: {
		[ENotificationChannel.EMAIL]?: boolean;
		[ENotificationChannel.TELEGRAM]?: boolean;
		[ENotificationChannel.DISCORD]?: boolean;
		[ENotificationChannel.SLACK]?: boolean;
		[ENotificationChannel.ELEMENT]?: boolean;
	};
	onChannelChange?: (channel: ENotificationChannel, enabled: boolean) => void;
}

const channelIcons = {
	[ENotificationChannel.EMAIL]: Mail,
	[ENotificationChannel.TELEGRAM]: TelegramIcon,
	[ENotificationChannel.DISCORD]: DiscordIcon,
	[ENotificationChannel.SLACK]: SlackIcon,
	[ENotificationChannel.ELEMENT]: ElementIcon
};

const getChannelLabels = (t: (key: string) => string) => ({
	[ENotificationChannel.EMAIL]: t('Profile.Settings.Notifications.email'),
	[ENotificationChannel.TELEGRAM]: t('Profile.Settings.Notifications.telegram'),
	[ENotificationChannel.DISCORD]: t('Profile.Settings.Notifications.discord'),
	[ENotificationChannel.SLACK]: t('Profile.Settings.Notifications.slack'),
	[ENotificationChannel.ELEMENT]: t('Profile.Settings.Notifications.element')
});

function NotificationItem({ title, description, checked, onCheckedChange, channels = {}, onChannelChange }: NotificationItemProps) {
	const t = useTranslations();
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const channelLabels = getChannelLabels(t);

	return (
		<div className='space-y-3'>
			<div className='flex items-start gap-3'>
				<Checkbox
					checked={checked}
					onCheckedChange={onCheckedChange}
					className='mt-1'
				/>
				<div className='flex-1 space-y-1'>
					<h4 className='text-sm font-medium text-text_primary'>{title}</h4>
					<p className='text-text_secondary text-xs'>{description}</p>

					<Collapsible
						open={isAdvancedOpen}
						onOpenChange={setIsAdvancedOpen}
					>
						<CollapsibleTrigger className='flex items-center gap-1 text-xs text-text_pink hover:underline'>
							{t('Profile.Settings.Notifications.advance')}
							<ChevronDown className={`h-3 w-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className='mt-2 flex items-center gap-2'>
								{Object.entries(channelIcons).map(([channel, IconComponent]) => {
									const isEnabled = channels[channel as ENotificationChannel];
									return (
										<button
											key={channel}
											type='button'
											onClick={() => {
												if (!checked) {
													onCheckedChange(true);
												}
												onChannelChange?.(channel as ENotificationChannel, !isEnabled);
											}}
											className={`rounded p-1 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-30'} hover:opacity-80`}
											title={channelLabels[channel as ENotificationChannel]}
										>
											{channel === ENotificationChannel.EMAIL ? (
												<IconComponent className='h-4 w-4 text-text_primary' />
											) : (
												<IconComponent
													width={16}
													height={16}
													className='text-text_primary'
												/>
											)}
										</button>
									);
								})}
							</div>{' '}
						</CollapsibleContent>
					</Collapsible>
				</div>
			</div>
		</div>
	);
}

export default NotificationItem;
