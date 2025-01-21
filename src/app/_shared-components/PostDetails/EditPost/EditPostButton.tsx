// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IPostListing } from '@/_shared/types';
import { Pencil } from 'lucide-react';
import { OutputData } from '@editorjs/editorjs';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import EditPost from './EditPost';

function EditPostButton({ postData, onEditPostSuccess }: { postData: IPostListing; onEditPostSuccess: (title: string, content: OutputData) => void }) {
	const t = useTranslations();
	const { user } = useUser();
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					size='sm'
					className='bg-grey_bg text-xs font-medium text-wallet_btn_text'
					leftIcon={<Pencil size={16} />}
					disabled={!user || !user.addresses.includes(getSubstrateAddress(postData.onChainInfo?.proposer || '') || '')}
				>
					{t('EditPost.editPostButton')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-3xl p-6'>
				<DialogHeader>
					<DialogTitle>{t('EditPost.editPost')}</DialogTitle>
				</DialogHeader>
				<EditPost
					postData={postData}
					onEditPostSuccess={onEditPostSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default EditPostButton;
