// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import KlaraBot from '@assets/delegation/klara/confirmed.gif';

interface DelegateXSuccessDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onViewDashboard?: () => void;
	onEditBot?: () => void;
}

function DelegateXSuccessDialog({ open, onOpenChange, onViewDashboard, onEditBot }: DelegateXSuccessDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='max-w-md border-none p-0 dark:border dark:border-border_grey'>
				<div className='overflow-hidden rounded-xl bg-bg_modal p-6 text-center'>
					<Image
						src={KlaraBot}
						alt='Klara Bot'
						width={200}
						height={200}
						className='pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2'
						priority
					/>
					<div className='pt-24'>
						<h3 className='text-xl font-semibold text-text_primary'>Delegation complete, your Delegate X is live.</h3>
						<p className='text-text_secondary mt-2 text-sm font-medium'>
							Delegate X is now active. Klara will monitor new referenda and vote using your chosen strategy. You’ll see summaries and comments on Polkassembly.
						</p>
						<hr className='my-4 border-border_grey' />
						<div className='flex flex-col gap-2'>
							<Button
								className='w-full'
								onClick={onViewDashboard}
							>
								View Dashboard
							</Button>
							<Button
								variant='secondary'
								className='w-full'
								onClick={onEditBot}
							>
								Edit Bot
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default memo(DelegateXSuccessDialog);
