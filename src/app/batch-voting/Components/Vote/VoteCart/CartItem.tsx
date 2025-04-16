// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EConvictionAmount, EReactQueryKeys, EVoteDecision, IVoteCartItem } from '@/_shared/types';
import { Ban, Eye, Pencil, ThumbsDown, ThumbsUp, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { THEME_COLORS } from '@/app/_style/theme';
import { Button } from '@/app/_shared-components/Button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { BatchVotingClientService } from '@/app/_client-services/batch_voting_client_service';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import EditCartItem from './EditCartItem';

function VoteDecisionUi({ voteDecision }: { voteDecision: EVoteDecision }) {
	const t = useTranslations();
	switch (voteDecision) {
		case EVoteDecision.AYE:
			return (
				<div className='itemscenter flex gap-x-1 text-xs text-success'>
					<ThumbsUp
						className='h-4 w-4'
						fill={THEME_COLORS.light.success}
					/>{' '}
					{t('BatchVote.aye')}
				</div>
			);
		case EVoteDecision.NAY:
			return (
				<div className='itemscenter flex gap-x-1 text-xs text-failure'>
					<ThumbsDown
						className='h-4 w-4'
						fill={THEME_COLORS.light.failure}
					/>{' '}
					{t('BatchVote.nay')}
				</div>
			);
		case EVoteDecision.SPLIT_ABSTAIN:
			return (
				<div className='itemscenter flex gap-x-1 text-xs text-decision_bar_indicator'>
					<Ban
						className='h-4 w-4'
						fill={THEME_COLORS.light.decision_bar_indicator}
					/>{' '}
					{t('BatchVote.abstain')}
				</div>
			);
		default:
			return null;
	}
}

function CartItem({ voteCartItem }: { voteCartItem: IVoteCartItem }) {
	const { user } = useUser();
	const network = getCurrentNetwork();
	const queryClient = useQueryClient();
	const t = useTranslations();

	const [loading, setLoading] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	const removeFromVoteCart = async () => {
		if (!user?.id) return;
		setLoading(true);

		const { data, error } = await BatchVotingClientService.deleteBatchVoteCartItem({ userId: user.id, id: voteCartItem.id });
		if (error || !data) {
			console.error(error);
			setLoading(false);
			return;
		}

		queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], (oldData: IVoteCartItem[]) => {
			return oldData.filter((item) => item.id !== voteCartItem.id);
		});

		setLoading(false);
	};

	return (
		<div className='relative flex flex-col gap-y-4 rounded-xl border border-border_grey px-2 py-4'>
			{loading && <LoadingLayover />}
			<div className='flex items-center gap-x-1 truncate text-sm text-text_primary'>
				<div className='flex flex-1 items-center gap-x-2 truncate'>
					<span>#{voteCartItem.postIndexOrHash}</span>
					<span className='flex-1 truncate'>{voteCartItem.title}</span>
				</div>
				<Link href={`/referenda/${voteCartItem.postIndexOrHash}`}>
					<Eye className='h-4 w-4' />
				</Link>
			</div>
			<Separator />
			<div className='flex items-center justify-between'>
				<VoteDecisionUi voteDecision={voteCartItem.decision} />
				<div className='flex items-center gap-x-1 text-xs text-text_primary'>
					<span>{voteCartItem.amount.aye && formatBnBalance(voteCartItem.amount.aye, { withUnit: true, numberAfterComma: 2 }, network)}</span>
					<span>{voteCartItem.amount.nay && formatBnBalance(voteCartItem.amount.nay, { withUnit: true, numberAfterComma: 2 }, network)}</span>
					<span>{voteCartItem.amount.abstain && formatBnBalance(voteCartItem.amount.abstain, { withUnit: true, numberAfterComma: 2 }, network)}</span>
					<span>{voteCartItem.conviction === EConvictionAmount.ZERO ? '0.1' : voteCartItem.conviction}x</span>
				</div>
				<div className='flex items-center gap-x-2'>
					<Dialog
						open={openEditDialog}
						onOpenChange={setOpenEditDialog}
					>
						<DialogTrigger asChild>
							<Button
								size='icon'
								variant='ghost'
								className='p-0 px-0 text-text_primary'
								disabled={voteCartItem.editDisabled}
							>
								<Pencil />
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-xl p-3 sm:p-6'>
							<DialogTitle>{t('BatchVote.editVote')}</DialogTitle>
							<EditCartItem
								voteCartItem={voteCartItem}
								onClose={() => setOpenEditDialog(false)}
							/>
						</DialogContent>
					</Dialog>
					<Button
						size='icon'
						variant='ghost'
						className='p-0 px-0 text-text_primary'
						onClick={removeFromVoteCart}
						disabled={voteCartItem.editDisabled}
					>
						<Trash />
					</Button>
				</div>
			</div>
		</div>
	);
}

export default CartItem;
