// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Alert, AlertDescription } from '@/app/_shared-components/Alert';
import { Separator } from '@/app/_shared-components/Separator';
import { CheckCircle, Info } from 'lucide-react';

interface DisabledConfirmationProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	channel: string;
}

function DisabledConfirmation({ open, onConfirm, onCancel, channel }: DisabledConfirmationProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isOpen && onCancel()}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<CheckCircle className='h-5 w-5 text-success' />
						Confirmation
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-blue-light-high dark:text-blue-dark-high text-base font-medium leading-5'>
						{`Are you sure you want to disable Polkassembly bot from your ${channel} channel chat?`}
					</p>

					<Alert
						variant='info'
						className='border-[#4E75FF] bg-[#4E75FF] text-white'
					>
						<Info className='h-4 w-4 text-white' />
						<AlertDescription className='text-white'>
							{`Are you sure you want to disable this Polkassembly bot? Disabling bot means no more notifications for ${channel} channel chat. Stay connected and informed by keeping the bot enabled.`}
						</AlertDescription>
					</Alert>

					<Separator />
				</div>

				<DialogFooter className='flex gap-2'>
					<Button
						variant='outline'
						onClick={onCancel}
						className='px-9 py-1'
					>
						Cancel
					</Button>
					<Button
						variant='default'
						onClick={onConfirm}
						className='px-9 py-1'
					>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DisabledConfirmation;
