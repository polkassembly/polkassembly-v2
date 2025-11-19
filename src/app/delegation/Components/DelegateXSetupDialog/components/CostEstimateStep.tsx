// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';

interface CostEstimateStepProps {
	onNext: () => void;
	estimatedCost?: string;
	isEditMode?: boolean;
}

function CostEstimateStep({ onNext, estimatedCost = '≈ 5 DOT', isEditMode = false }: CostEstimateStepProps) {
	if (isEditMode) {
		return null;
	}

	return (
		<div className='space-y-4'>
			<div className='rounded-lg border border-border_grey bg-delegation_bgcard p-4'>
				<div className='mb-2 flex items-center gap-2'>
					<p className='font-semibold text-text_primary'>Cost Estimate</p>
					<Image
						src={QuestionIcon}
						alt='Question Icon'
						width={16}
						height={16}
					/>
				</div>
				<p className='text-sm text-text_primary'>To activate your delegate, we&apos;ll create a wallet and reserve a small amount of DOT for gas fees.</p>

				<div className='relative pt-4'>
					<input
						id='est-setup-cost'
						aria-describedby='est-setup-help'
						className='w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 pr-20 text-sm font-medium outline-none placeholder:text-text_primary'
						value=''
						placeholder='Estimated setup cost'
						disabled
					/>

					<span
						className='absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-3 py-1 pt-5 text-sm font-semibold text-text_primary'
						title='Exact amount confirmed when you sign the transaction.'
					>
						{estimatedCost}
					</span>
				</div>

				<p
					id='est-setup-help'
					className='mt-2 text-xs italic text-wallet_btn_text'
				>
					Insufficient Funds, 2 DOT is needed to cover up gas fee for delegate setup
				</p>
			</div>

			<div className='flex items-center justify-end'>
				<Button
					className='px-5'
					onClick={onNext}
				>
					Proceed to Templates <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(CostEstimateStep);
