// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPost } from '@/_shared/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { useRouter } from 'next/navigation';
import { MdFullscreen } from 'react-icons/md';
import { useTranslations } from 'next-intl';

interface ReferendaDialogProps {
	data: IPost;
	index: string;
}

export default function ReferendaDialog({ data, index }: ReferendaDialogProps) {
	const router = useRouter();
	const t = useTranslations();

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='m-0 h-[80vh] max-w-5xl overflow-y-auto p-0'>
				<DialogHeader>
					<DialogTitle>
						<p className='pt-4'>{t('ListingTab.Referenda')}</p>
					</DialogTitle>
					<MdFullscreen className='pr-5 pt-0.5 text-4xl' />
				</DialogHeader>
				<PostDetails
					index={index}
					postData={data}
				/>
			</DialogContent>
		</Dialog>
	);
}
