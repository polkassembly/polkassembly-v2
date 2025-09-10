// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { cn } from '@/lib/utils';
import DVBadgeIcon from '@assets/icons/dv-badge.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';

function DVBadge({ className }: { className?: string }) {
	const t = useTranslations();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Image
					alt='DV Badge'
					className={cn('h-6 w-6', className)}
					src={DVBadgeIcon}
					height={24}
					width={24}
				/>
			</TooltipTrigger>
			<TooltipContent
				side='top'
				align='center'
				className='bg-tooltip_background'
			>
				{t('DVBadge.decentralizedVoice')}
			</TooltipContent>
		</Tooltip>
	);
}

export default DVBadge;
