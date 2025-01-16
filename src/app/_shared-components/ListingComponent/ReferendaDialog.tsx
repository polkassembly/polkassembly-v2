// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPost } from '@/_shared/types';
import { Dialog, DialogContent } from '@ui/Dialog';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { useRouter } from 'next/navigation';
import { MdFullscreen } from 'react-icons/md';
import { MouseEvent } from 'react';

interface ReferendaDialogProps {
	data: IPost;
	index: string;
}

export default function ReferendaDialog({ data, index }: ReferendaDialogProps) {
	const router = useRouter();

	const handleOpenChange = () => {
		router.back();
	};

	const handleFullscreenClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		router.back();

		setTimeout(() => {
			window.location.href = `/referenda/${index}`;
		}, 100);
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='m-0 h-[80vh] max-w-4xl overflow-y-auto p-0'>
				<div className='relative'>
					<div className='absolute right-12 top-4'>
						<button
							onClick={handleFullscreenClick}
							type='button'
							className='transition-opacity hover:opacity-75'
						>
							<MdFullscreen className='text-lg text-text_primary' />
						</button>{' '}
					</div>
					<PostDetails
						index={index}
						postData={data}
						isModalOpen
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
