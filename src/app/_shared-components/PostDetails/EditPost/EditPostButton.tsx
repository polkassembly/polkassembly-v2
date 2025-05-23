// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { IPost, IPostListing } from '@/_shared/types';
import { Pencil } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import EditPost from './EditPost';

function EditPostButton({ postData, className }: { postData: IPostListing | IPost; className?: string }) {
	const t = useTranslations();
	const { user } = useUser();
	const [isOpen, setIsOpen] = useState(false);

	const canEditOffChain = user && user.id === postData.userId;

	const proposerAddress = postData.onChainInfo?.proposer && getSubstrateAddress(postData.onChainInfo?.proposer);
	const canEditOnChain = user && proposerAddress && user.addresses.includes(proposerAddress);

	const canEdit = canEditOffChain || canEditOnChain;

	if (!canEdit) return null;
	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					size='sm'
					className={cn('bg-grey_bg text-xs font-medium text-wallet_btn_text', className)}
					leftIcon={<Pencil size={16} />}
					disabled={!canEdit}
				>
					{t('EditPost.editPostButton')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-max p-3 sm:p-6'>
				<DialogHeader>
					<DialogTitle>{t('EditPost.edit')}</DialogTitle>
				</DialogHeader>
				<div className='max-w-3xl'>
					<EditPost
						postData={postData}
						onClose={() => setIsOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default EditPostButton;
