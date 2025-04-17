// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { MdChecklist, MdOutlineExposurePlus1, MdOutlineFormatListBulleted } from 'react-icons/md';

interface PeriodDetailModalProps {
	children: React.ReactNode;
}

function PeriodDetailModal({ children }: PeriodDetailModalProps) {
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
									<span className='text-base font-medium'>Prepare Period</span>
								</div>
							</div>
						</div>
						<div className='ml-[76px]'>
							<p className='text-sm text-btn_secondary_text'>The prepare period is used to avoid decision sniping. It occurs before a referendum goes into voting.</p>
						</div>
					</div>

					{/* Voting Period */}
					<div className='relative mb-5'>
						<div className='mb-1 flex items-center'>
							<div className='z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg_pink text-base font-bold text-white'>2</div>
							<div className='ml-4'>
								<div className='flex items-center space-x-2'>
									<MdOutlineExposurePlus1 className='text-lg font-semibold text-bg_pink' />
									<span className='text-base font-medium'>Voting Period</span>
								</div>
							</div>
						</div>
						<div className='ml-[60px]'>
							<ul className='list-disc pl-4 text-sm text-btn_secondary_text'>
								<li>A referendum will be in voting till the decision period is completed or the proposal is passed.</li>
								<li>For a referendum to enter confirmation, the support and approval should be greater than the threshold for the track.</li>
								<li>
									Once the proposal enters confirmation, its support and approval should remain greater than the threshold for the duration of the confirmation period for it to
									pass.
								</li>
								<li>If the referendum does not enter confirmation during the decision period, it is considered as failed.</li>
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
									<span className='text-base font-medium'>After Voting Period</span>
								</div>
							</div>
						</div>
						<div className='ml-[60px]'>
							<ul className='list-disc pl-4 text-sm text-btn_secondary_text'>
								<li>A referendum is executed after the completion of the enactment period.</li>
								<li>For treasury referenda, the funds will be disbursed after completion of the funds disbursal period.</li>
							</ul>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PeriodDetailModal;
