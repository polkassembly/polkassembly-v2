// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, ReactNode, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/app/_shared-components/Dialog/Dialog';
import UndelegateIcon from '@assets/delegation/undelegate.svg';
import EditVoteStrategyIcon from '@assets/delegation/undelegated.svg';
import EditPersonalityIcon from '@assets/delegation/editpersonality.svg';
import Klara from '@assets/delegation/klara/klara.svg';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';

interface EditDelegateXDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditStrategy: () => void;
	onEditPersonality: () => void;
	onUndelegate: () => Promise<void>;
}

function Card({ children, onClick }: { children: ReactNode; onClick: () => void }) {
	return (
		<div className='group rounded-xl bg-gradient-to-b from-delegatebotx_border to-transparent p-[1px] transition-colors'>
			<button
				type='button'
				onClick={onClick}
				className='flex h-full w-full cursor-pointer flex-row items-center gap-4 rounded-xl border border-transparent bg-bg_modal p-4 text-left group-hover:border-text_pink md:flex-col md:gap-3 md:p-6'
			>
				{children}
			</button>
		</div>
	);
}

const EditDelegateXDialog = memo(({ open, onOpenChange, onEditStrategy, onEditPersonality, onUndelegate }: EditDelegateXDialogProps) => {
	const [loading, setLoading] = useState(false);
	const handleUndelegate = async () => {
		setLoading(true);
		await onUndelegate();
		setLoading(false);
	};
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='w-[95vw] max-w-3xl p-0 sm:mx-auto'>
				<div className='flex items-center justify-between gap-3 border-b border-border_grey px-4 py-3'>
					<div className='flex items-center gap-2'>
						<Image
							src={Klara}
							alt='Klara'
							width={28}
							height={28}
						/>
						<span className='text-xl font-semibold'>DelegateX</span>
						<span className='text-xs text-btn_secondary_text'>Powered by</span>
						<span className='rounded-full bg-delegation_bgcard p-1 px-2 text-xs'>CyberGov</span>
					</div>
				</div>
				<div className='grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-3'>
					<Card onClick={handleUndelegate}>
						<div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-delegation_bgcard md:h-24 md:w-24', loading && 'opacity-50')}>
							<Image
								src={UndelegateIcon}
								alt='Undelegate'
								width={48}
								height={48}
								className='h-8 w-8 md:h-12 md:w-12'
							/>
						</div>
						<div className={cn('flex flex-col', loading && 'opacity-50')}>
							<p className='text-base font-semibold'>{loading ? <LoadingSpinner show={loading} /> : 'Undelegate'}</p>
							<p className='text-text_secondary text-sm'>Take back control of your votes. Your delegation link will be removed, and you’ll be able to vote directly again.</p>
						</div>
					</Card>
					<Card onClick={onEditStrategy}>
						<div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-delegation_bgcard md:h-24 md:w-24'>
							<Image
								src={EditVoteStrategyIcon}
								alt='Edit Voting Strategy'
								width={48}
								height={48}
								className='h-8 w-8 md:h-12 md:w-12'
							/>
						</div>
						<div className='flex flex-col'>
							<p className='text-base font-semibold'>Edit Voting Strategy</p>
							<p className='text-text_secondary text-sm'>Refine how your bot decides on proposals to match your governance goals.</p>
						</div>
					</Card>
					<Card onClick={onEditPersonality}>
						<div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-delegation_bgcard md:h-24 md:w-24'>
							<Image
								src={EditPersonalityIcon}
								alt='Edit Personality'
								width={48}
								height={48}
								className='h-8 w-8 md:h-12 md:w-12'
							/>
						</div>
						<div className='flex flex-col'>
							<p className='text-base font-semibold'>Edit Personality</p>
							<p className='text-text_secondary text-sm'>Redefine your bot’s tone and decision style. Choose how it reasons and represents you.</p>
						</div>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
});

export default EditDelegateXDialog;
