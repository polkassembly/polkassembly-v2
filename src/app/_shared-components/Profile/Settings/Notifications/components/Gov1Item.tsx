// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { Switch } from '@/app/_shared-components/Switch';
import { ReactNode, memo } from 'react';

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
	singleKey?: boolean;
}

const Gov1Item = memo(function Gov1Item({
	icon,
	title,
	enabled,
	notifications = {},
	notificationLabels = {},
	onEnabledChange,
	onNotificationChange,
	singleKey = false
}: Gov1ItemProps) {
	const t = useTranslations('Profile.Settings.Notifications');

	if (singleKey) {
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
						className='h-4 w-8 border border-btn_secondary_text bg-transparent px-0.5 data-[state=checked]:bg-switch_inactive_bg data-[state=unchecked]:bg-transparent'
						thumbClassName='h-2 w-2 bg-btn_secondary_text'
					/>
					<span className='text-text_secondary text-xs'>{t('all')}</span>
				</div>
			</div>

			<div className='ml-6 space-y-2'>
				{Object.entries(notificationLabels).map(([key, label]) => (
					<div
						key={key}
						className='flex items-center gap-2'
					>
						<Checkbox
							checked={notifications[key] || false}
							onCheckedChange={(checked) => onNotificationChange?.(key, checked as boolean)}
						/>
						<span className='text-text_secondary text-xs'>{label}</span>
					</div>
				))}
			</div>
		</div>
	);
});

export default Gov1Item;
