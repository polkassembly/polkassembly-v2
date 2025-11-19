// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';

interface ConfirmationStepProps {
	onConfirm: () => void;
	displayName: string;
	selectedStrategy: string;
	estimatedFee?: string;
	isEditMode?: boolean;
}

function ConfirmationStep({ onConfirm, displayName, selectedStrategy, estimatedFee = '≈ 5 DOT', isEditMode = false }: ConfirmationStepProps) {
	if (isEditMode) {
		return null;
	}

	return (
		<div className='space-y-4 rounded-lg bg-delegation_bgcard p-4'>
			<div>
				<div className='mb-2 flex items-center gap-2'>
					<p className='font-semibold text-text_primary'>Confirm Delegation & Gas Deposit</p>
					<Image
						src={QuestionIcon}
						alt='Question Icon'
						width={16}
						height={16}
					/>
				</div>
				<p className='text-text_secondary text-sm'>
					We&apos;ll now create your delegate wallet and register it on-chain. You&apos;ll be asked to sign two transactions: delegation and gas deposit.
				</p>
			</div>

			<div>
				<div className='space-y-3'>
					<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
						<span className='text-text_secondary'>Template:</span>
						<span className='font-medium'>{selectedStrategy}</span>
					</div>
					<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
						<span className='text-text_secondary'>Personality Name:</span>
						<span className='font-medium'>{displayName || 'Alice'}</span>
					</div>
					<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
						<span className='text-text_secondary'>Estimated Fee:</span>
						<span className='font-medium'>{estimatedFee}</span>
					</div>
				</div>
			</div>

			<div className='flex items-center justify-end'>
				<Button
					className='px-5'
					onClick={onConfirm}
				>
					Confirm & Delegate <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(ConfirmationStep);
