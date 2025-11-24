// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';
import { Button } from '@/app/_shared-components/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';

interface ConfirmationStepProps {
	onConfirm: () => void;
	displayName: string;
	selectedStrategy: string;
	estimatedFee?: string;
	isEditMode?: boolean;
	votingPower?: string;
	isLoading?: boolean;
}

function ConfirmationStep({ onConfirm, displayName, selectedStrategy, estimatedFee, isEditMode = false, votingPower, isLoading }: ConfirmationStepProps) {
	if (isEditMode) {
		return null;
	}

	return (
		<div className='space-y-4'>
			<div className='rounded-lg bg-delegation_bgcard p-4 sm:p-6'>
				<div>
					<div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
						<div className='flex items-center gap-2'>
							<p className='font-semibold text-text_primary'>Confirm Delegation & Gas Deposit</p>
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
										By confirming, you agree to create your delegate wallet and register it on-chain. You will be prompted to sign two transactions: one for delegation and another
										for gas deposit.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
					<p className='text-text_secondary text-sm'>
						We&apos;ll now create your delegate wallet and register it on-chain. You&apos;ll be asked to sign two transactions: delegation and gas deposit.
					</p>
				</div>

				<div className='mt-4'>
					<div className='space-y-3'>
						<div className='flex flex-col gap-1 rounded-md bg-bg_modal px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2'>
							<span className='text-text_secondary'>Template:</span>
							<span className='font-medium'>{selectedStrategy}</span>
						</div>
						<div className='flex flex-col gap-1 rounded-md bg-bg_modal px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2'>
							<span className='text-text_secondary'>Personality Name:</span>
							<span className='font-medium'>{displayName || '-'}</span>
						</div>
						<div className='flex flex-col gap-1 rounded-md bg-bg_modal px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2'>
							<span className='text-text_secondary'>Voting Power:</span>
							<span className='font-medium'>{votingPower}</span>
						</div>
						<div className='flex flex-col gap-1 rounded-md bg-bg_modal px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2'>
							<span className='text-text_secondary'>Conviction:</span>
							<span className='font-medium'>0.1x</span>
						</div>
						<div className='flex flex-col gap-1 rounded-md bg-bg_modal px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2'>
							<span className='text-text_secondary'>Estimated Fee:</span>
							<span className='font-medium'>{estimatedFee}</span>
						</div>
					</div>
				</div>
			</div>

			<div className='flex items-center justify-center sm:justify-end'>
				<Button
					isLoading={isLoading}
					className='w-full px-5 sm:w-auto'
					onClick={onConfirm}
				>
					Confirm & Delegate <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(ConfirmationStep);
