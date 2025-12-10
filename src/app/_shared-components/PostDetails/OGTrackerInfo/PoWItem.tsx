// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { IOGTrackerPoW } from '@/_shared/types';

function PoWItem({ pow }: { pow: IOGTrackerPoW }) {
	const t = useTranslations();
	if (ValidatorService.isUrl(pow.content)) {
		return (
			<a
				href={pow.content}
				target='_blank'
				rel='noopener noreferrer'
				className='bg-bg_secondary hover:border-pink_primary/50 hover:bg-bg_tertiary group flex items-center justify-between gap-3 rounded-lg border border-border_grey p-3 transition-all'
			>
				<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
					<div className='text-pink_primary truncate text-sm font-medium group-hover:underline'>{pow.content}</div>
					{pow.task_id && <div className='text-[10px] text-text_primary'>{t('PostDetails.OGTracker.linkedToTask')}</div>}
				</div>
				<ExternalLink className='group-hover:text-pink_primary h-3.5 w-3.5 flex-shrink-0 text-wallet_btn_text transition-colors' />
			</a>
		);
	}
	return (
		<div className='bg-bg_secondary flex items-center justify-between gap-3 rounded-lg border border-border_grey p-3'>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<div className='truncate text-sm font-medium text-text_primary'>{pow.content}</div>
				{pow.task_id && <div className='text-[10px] text-text_primary'>{t('PostDetails.OGTracker.linkedToTask')}</div>}
			</div>
		</div>
	);
}

export default PoWItem;
