// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Download, X } from 'lucide-react';

interface ImportPrimaryNetworkModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	primaryNetwork: string;
}

function ImportPrimaryNetworkModal({ open, onClose, onConfirm, primaryNetwork }: ImportPrimaryNetworkModalProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Download className='text-text_secondary h-5 w-5' />
							<DialogTitle>Add Networks</DialogTitle>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='text-text_secondary hover:text-text_primary'
						>
							<X className='h-4 w-4' />
						</button>
					</div>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-sm text-text_primary'>Pre-existing settings will be changed for the following networks:</p>

					<div className='rounded-lg bg-gray-50 p-3'>
						<div className='flex flex-wrap gap-2'>
							<div className='flex items-center gap-2 rounded-full border bg-white px-3 py-1'>
								<div className='h-3 w-3 rounded-full bg-pink-500' />
								<span className='text-xs text-text_primary'>Polkadot</span>
							</div>
							<div className='flex items-center gap-2 rounded-full border bg-white px-3 py-1'>
								<div className='h-3 w-3 rounded-full bg-teal-400' />
								<span className='text-xs text-text_primary'>Moonbeam</span>
							</div>
							<div className='flex items-center gap-2 rounded-full border bg-white px-3 py-1'>
								<div className='h-3 w-3 rounded-full bg-purple-600' />
								<span className='text-xs text-text_primary'>Moonwell</span>
							</div>
						</div>
					</div>

					<div className='flex items-center justify-center'>
						<div className='flex items-center gap-2 rounded-full border-2 border-pink-500 px-4 py-2'>
							<div className='h-4 w-4 rounded-full bg-black' />
							<span className='text-sm font-medium text-text_primary'>{primaryNetwork}</span>
						</div>
					</div>

					<p className='text-text_secondary text-center text-sm'>is set as your Primary Network.</p>

					<p className='text-sm text-text_primary'>Are you sure you want to import {primaryNetwork}&apos;s Network settings to all selected networks?</p>

					<div className='flex gap-2 pt-4'>
						<Button
							variant='outline'
							onClick={onClose}
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							onClick={onConfirm}
							className='flex-1 bg-pink-500 hover:bg-pink-600'
						>
							Confirm
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ImportPrimaryNetworkModal;
