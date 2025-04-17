// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { MdChecklist, MdOutlineExposurePlus1, MdOutlineFormatListBulleted } from 'react-icons/md';

interface PeriodDetailModalProps {
	children: React.ReactNode;
}

function PeriodDetailModal({ children }: PeriodDetailModalProps) {
	const t = useTranslations('PostDetails');
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='btn_secondary_text max-w-lg p-3 sm:p-6'>
				<DialogTitle className='mb-3 text-xl font-medium'>Status</DialogTitle>

				<div className='relative'>
					<div className='absolute bottom-0 left-4 top-0 h-[360px] w-0.5 bg-bg_pink' />

					{/* Prepare Period */}
					<div className='relative mb-5'>
						<div className='mb-1 flex items-center'>
							<div className='z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg_pink text-base font-bold text-white'>1</div>
							<div className='ml-5'>
								<div className='flex items-center space-x-2'>
									<MdChecklist className='text-lg font-semibold text-bg_pink' />
									<span className='text-base font-medium'>{t('preparePeriod')}</span>
								</div>
							</div>
						</div>
						<div className='ml-[76px]'>
							<p className='text-sm text-btn_secondary_text'>{t('preparePeriodDesc')}</p>
						</div>
					</div>

					{/* Voting Period */}
					<div className='relative mb-5'>
						<div className='mb-1 flex items-center'>
							<div className='z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg_pink text-base font-bold text-white'>2</div>
							<div className='ml-4'>
								<div className='flex items-center space-x-2'>
									<MdOutlineExposurePlus1 className='text-lg font-semibold text-bg_pink' />
									<span className='text-base font-medium'>{t('votingPeriod')}</span>
								</div>
							</div>
						</div>
						<div className='ml-[60px]'>
							<ul className='list-disc pl-4 text-sm text-btn_secondary_text'>
								<li>{t('votingPeriodList.votingPeriodList1')}</li>
								<li>{t('votingPeriodList.votingPeriodList2')}</li>
								<li>{t('votingPeriodList.votingPeriodList3')}</li>
								<li>{t('votingPeriodList.votingPeriodList4')}</li>
							</ul>
						</div>
					</div>

					{/* After Voting Period */}
					<div className='relative mb-3'>
						<div className='mb-1 flex items-center'>
							<div className='z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg_pink text-base font-bold text-white'>3</div>
							<div className='ml-4'>
								<div className='flex items-center space-x-2'>
									<MdOutlineFormatListBulleted className='text-lg font-semibold text-bg_pink' />
									<span className='text-base font-medium'>{t('afterVotingPeriod')}</span>
								</div>
							</div>
						</div>
						<div className='ml-[60px]'>
							<ul className='list-disc pl-4 text-sm text-btn_secondary_text'>
								<li>{t('afterVotingPeriodList.afterVotingPeriodList1')}</li>
								<li>{t('afterVotingPeriodList.afterVotingPeriodList2')}</li>
							</ul>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PeriodDetailModal;
