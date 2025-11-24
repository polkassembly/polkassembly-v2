// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';

interface CostEstimateStepProps {
	onNext: () => void;
	estimatedCost?: string;
	isEditMode?: boolean;
	networkSymbol?: string;
}

function CostEstimateStep({ onNext, estimatedCost, isEditMode = false, networkSymbol }: CostEstimateStepProps) {
	if (isEditMode) {
		return null;
	}

	return (
		<div className='space-y-4'>
			<div className='rounded-lg border border-border_grey bg-delegation_bgcard p-4 sm:p-6'>
				<div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
					<div className='flex items-center gap-2'>
						<p className='font-semibold text-text_primary'>Cost Estimate</p>
						<Tooltip>
							<TooltipTrigger>
								<Image
									src={QuestionIcon}
									alt='Question Icon'
									width={16}
									height={16}
								/>
							</TooltipTrigger>
							<TooltipContent className='bg-tooltip_background p-2 text-white'>
								<p className='max-w-xs text-xs'>
									This is an estimate of the costs involved in setting up your delegate. The exact amount will be confirmed when you sign the transaction.
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
				<p className='text-sm text-text_primary'>To activate your delegate, we&apos;ll create a wallet and reserve a small amount of {networkSymbol} for gas fees.</p>

				<div className='relative pt-4'>
					<input
						id='est-setup-cost'
						aria-describedby='est-setup-help'
						className='w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 pr-16 text-sm font-medium outline-none placeholder:text-text_primary sm:pr-20'
						value=''
						placeholder='Estimated setup cost'
						disabled
					/>

					<span
						className='absolute right-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 pt-5 text-xs font-semibold text-text_primary sm:right-3 sm:px-3 sm:text-sm'
						title='Exact amount confirmed when you sign the transaction.'
					>
						{estimatedCost}
					</span>
				</div>

				<p
					id='est-setup-help'
					className='mt-2 text-xs italic text-wallet_btn_text'
				>
					Insufficient Funds, 2 {networkSymbol} is needed to cover up gas fee for delegate setup
				</p>
			</div>

			<div className='flex items-center justify-center sm:justify-end'>
				<Button
					className='w-full px-5 sm:w-auto'
					onClick={onNext}
				>
					Proceed to Templates <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(CostEstimateStep);
