// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Switch } from '@/app/_shared-components/Switch';
import { memo } from 'react';
import { ENotificationChannel } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { InAPPIcon } from './Icons';

interface InAPPNotificationCardProps {
	enabled: boolean;
	handleEnableDisabled: (channel: ENotificationChannel, enabled: boolean) => void;
}

const InAPPNotificationCard = memo(function InAPPNotificationCard({ enabled, handleEnableDisabled }: InAPPNotificationCardProps) {
	const t = useTranslations('Profile.Settings.Notifications');
	return (
		<div className='flex items-start gap-3 rounded-lg p-4'>
			{/* Icon */}
			<div className='mt-1'>
				<InAPPIcon
					width={20}
					height={20}
					className='text-text_primary'
				/>
			</div>

			{/* Title + Toggle */}
			<div className='flex-1 text-btn_secondary_text'>
				<div className='flex items-center gap-2'>
					<h4 className='text-base font-medium text-text_primary'>{t('inAppNotifications')}</h4>
				</div>

				<div className='mt-2 flex items-center gap-2'>
					<Switch
						checked={enabled}
						onCheckedChange={(checked) => handleEnableDisabled(ENotificationChannel.IN_APP, checked)}
						className='h-4 w-8 border border-btn_secondary_text bg-transparent px-0.5 data-[state=checked]:bg-switch_inactive_bg data-[state=unchecked]:bg-transparent'
						thumbClassName='h-2 w-2 bg-btn_secondary_text'
					/>

					<span className='text-sm text-btn_secondary_text'>
						{enabled ? t('on') : t('off')} <span className='text-text_primary'>{t('inAppDescription')}</span>
					</span>
				</div>
			</div>
		</div>
	);
});

export default InAPPNotificationCard;
