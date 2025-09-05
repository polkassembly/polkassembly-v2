// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { Switch } from '@/app/_shared-components/Switch';
import { ReactNode } from 'react';

interface TrackItemProps {
	icon: ReactNode;
	title: string;
	enabled: boolean;
	notifications: {
		newReferendumSubmitted: boolean;
		referendumInVoting: boolean;
		referendumClosed: boolean;
	};
	onEnabledChange: (enabled: boolean) => void;
	onNotificationChange: (type: string, enabled: boolean) => void;
}

function TrackItem({ icon, title, enabled, notifications, onEnabledChange, onNotificationChange }: TrackItemProps) {
	const t = useTranslations('Profile.Settings.Notifications');
	const handleToggleAll = (newEnabled: boolean) => {
		onEnabledChange(newEnabled);
	};

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
						onCheckedChange={handleToggleAll}
					/>
					<span className='text-text_secondary text-xs'>{t('all')}</span>
				</div>
			</div>

			<div className='ml-6 space-y-2'>
				<div className='flex items-center gap-2'>
					<Checkbox
						checked={notifications.newReferendumSubmitted}
						onCheckedChange={(checked) => onNotificationChange('newReferendumSubmitted', checked as boolean)}
					/>
					<span className='text-text_secondary text-xs'>{t('newReferendumSubmitted')}</span>
				</div>

				<div className='flex items-center gap-2'>
					<Checkbox
						checked={notifications.referendumInVoting}
						onCheckedChange={(checked) => onNotificationChange('referendumInVoting', checked as boolean)}
					/>
					<span className='text-text_secondary text-xs'>{t('referendumInVoting')}</span>
				</div>

				<div className='flex items-center gap-2'>
					<Checkbox
						checked={notifications.referendumClosed}
						onCheckedChange={(checked) => onNotificationChange('referendumClosed', checked as boolean)}
					/>
					<span className='text-text_secondary text-xs'>{t('referendumClosed')}</span>
				</div>
			</div>
		</div>
	);
}

export default TrackItem;
