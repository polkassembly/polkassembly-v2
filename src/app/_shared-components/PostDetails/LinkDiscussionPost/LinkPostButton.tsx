// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { IPost, IPostListing } from '@/_shared/types';
import { Link } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { OFF_CHAIN_PROPOSAL_TYPES } from '@/_shared/_constants/offChainProposalTypes';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import LinkDiscussionPost from './LinkDiscussionPost';

function LinkPostButton({ postData, className }: { postData: IPostListing | IPost; className?: string }) {
	const t = useTranslations();
	const { user } = useUser();
	const [isOpen, setIsOpen] = useState(false);

	const proposerAddress = postData.onChainInfo?.proposer && getSubstrateAddress(postData.onChainInfo?.proposer);
	const canLink = user && proposerAddress && user.addresses.includes(proposerAddress) && !OFF_CHAIN_PROPOSAL_TYPES.includes(postData.proposalType);

	if (!canLink) return null;

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
					leftIcon={<Link size={16} />}
					disabled={!canLink}
				>
					{t('LinkDiscussionPost.linkDiscussion')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-3 sm:p-6'>
				<DialogHeader>
					<DialogTitle>{t('LinkDiscussionPost.linkDiscussion')}</DialogTitle>
				</DialogHeader>
				<LinkDiscussionPost
					postData={postData}
					onClose={() => setIsOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default LinkPostButton;
