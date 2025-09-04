// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { Switch } from '@/app/_shared-components/Switch';
import { ReactNode } from 'react';

interface Gov1ItemProps {
	icon: ReactNode;
	title: string;
	enabled: boolean;
	notifications?: {
		[key: string]: boolean;
	};
	notificationLabels?: {
		[key: string]: string;
	};
	onEnabledChange: (enabled: boolean) => void;
	onNotificationChange?: (type: string, enabled: boolean) => void;
	isSimple?: boolean;
}

function Gov1Item({ icon, title, enabled, notifications = {}, notificationLabels = {}, onEnabledChange, onNotificationChange, isSimple = false }: Gov1ItemProps) {
	const t = useTranslations('Profile.Settings.Notifications');

	if (isSimple) {
		return (
			<div className='flex items-center gap-2'>
				<Checkbox
					checked={enabled}
					onCheckedChange={onEnabledChange}
				/>
				<span className='text-text_secondary text-sm'>{title}</span>
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-3'>
				<div className='flex items-center gap-2'>
					{icon}
					<h4 className='text-sm font-medium text-text_primary'>{title}</h4>
				</div>
				<div className='flex items-center gap-2'>
					<Switch
						checked={enabled}
						onCheckedChange={onEnabledChange}
					/>
					<span className='text-text_secondary text-xs'>{t('Profile.Settings.Notifications.all')}</span>
				</div>
			</div>

			<div className='ml-6 space-y-2'>
				{Object.entries(notifications)
					.filter(([key]) => notificationLabels[key])
					.map(([key, value]) => (
						<div
							key={key}
							className='flex items-center gap-2'
						>
							<Checkbox
								checked={value}
								onCheckedChange={(checked) => onNotificationChange?.(key, checked as boolean)}
							/>
							<span className='text-text_secondary text-xs'>{notificationLabels[key]}</span>
						</div>
					))}
			</div>
		</div>
	);
}

export default Gov1Item;
