// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Check, X, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

function VoteLegend() {
	const t = useTranslations('DecentralizedVoices');

	return (
		<div className='flex flex-wrap items-center gap-6 rounded-lg border border-border_grey bg-bg_modal p-4'>
			<span className='font-semibold text-text_primary'>{t('Legend')}</span>
			<div className='flex items-center gap-2'>
				<div className='flex h-6 w-6 items-center justify-center rounded bg-success_vote_bg text-aye_color'>
					<Check size={14} />
				</div>
				<span className='text-sm text-text_primary'>{t('Aye')}</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='flex h-6 w-6 items-center justify-center rounded bg-failure_vote_bg text-nay_color'>
					<X size={14} />
				</div>
				<span className='text-sm text-text_primary'>{t('Nay')}</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='flex h-6 w-6 items-center justify-center rounded bg-activity_selected_tab text-abstain_color'>
					<Minus size={14} />
				</div>
				<span className='text-sm text-text_primary'>{t('Abstain')}</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='flex h-6 w-6 items-center justify-center rounded bg-activity_selected_tab text-text_primary'>
					<div className='h-1 w-1 rounded-full bg-current' />
				</div>
				<span className='text-sm text-text_primary'>{t('NoVote')}</span>
			</div>
		</div>
	);
}

export default VoteLegend;
