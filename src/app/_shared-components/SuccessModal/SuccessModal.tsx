// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import SuccessGif from '@assets/gifs/success.gif';
import { Dialog, DialogContent, DialogHeader } from '../Dialog/Dialog';
import { useSuccessModal } from '../../../hooks/useSuccessModal';

function SuccessModal() {
	const { open, content, setOpenSuccessModal } = useSuccessModal();

	return (
		<Dialog
			open={open}
			onOpenChange={setOpenSuccessModal}
		>
			<DialogContent className='max-w-2xl p-6'>
				<DialogHeader className='border-none' />
				<div className='relative max-w-full'>
					<Image
						className='absolute left-1/2 top-[-125px] -translate-x-1/2 -translate-y-1/2'
						src={SuccessGif}
						alt='success'
						width={350}
						height={350}
					/>
					<div className='max-w-full pt-6'>{content || <div className='w-full text-center text-lg font-medium text-text_primary'>Success!!</div>}</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default SuccessModal;
