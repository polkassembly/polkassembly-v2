// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EReactQueryKeys, IVoteCartItem } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import React, { useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import { BatchVotingClientService } from '@/app/_client-services/batch_voting_client_service';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import CartItem from './CartItem';

function VoteCart({ voteCart }: { voteCart: IVoteCartItem[] }) {
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations();

	const [loading, setLoading] = useState<boolean>(false);
	const [clearCartLoading, setClearCartLoading] = useState<boolean>(false);

	const { user } = useUser();
	const queryClient = useQueryClient();

	const clearCart = async () => {
		if (!user?.id) return;
		setClearCartLoading(true);

		const { data, error } = await BatchVotingClientService.clearBatchVoteCart({ userId: user.id });
		if (error || !data) {
			console.error(error);
			setClearCartLoading(false);
			return;
		}

		queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], () => {
			return [];
		});

		setClearCartLoading(false);
	};

	const confirmBatchVoting = async () => {
		if (!userPreferences.selectedAccount?.address || voteCart.length === 0) return;

		setLoading(true);
		await apiService?.batchVoteReferendum({
			address: userPreferences.selectedAccount.address,
			voteCartItems: voteCart,
			onSuccess: () => {
				setLoading(false);
			},
			onFailed: () => {
				setLoading(false);
			}
		});
	};
	return (
		<div className='flex h-full flex-col gap-y-4'>
			<div className='flex max-h-[300px] min-h-[200px] flex-1 flex-col gap-y-2 overflow-y-auto'>
				{voteCart.length > 0 ? (
					voteCart.map((item) => (
						<CartItem
							key={item.id}
							voteCartItem={item}
						/>
					))
				) : (
					<div className='mb-8 flex flex-col items-center gap-y-2'>
						<p>{t('BatchVote.noItemsInVoteCart')}</p>
					</div>
				)}
			</div>
			<div className='flex flex-col gap-y-2'>
				<div className='flex w-full items-center justify-between'>
					<span>Proposals: {voteCart.length}</span>
					{voteCart.length > 0 && (
						<Button
							isLoading={clearCartLoading}
							onClick={clearCart}
							disabled={voteCart.length === 0}
							size='sm'
						>
							Clear
						</Button>
					)}
				</div>
				<Button
					isLoading={loading}
					disabled={voteCart.length === 0}
					className='w-full'
					onClick={confirmBatchVoting}
				>
					{t('BatchVote.confirmBatchVoting')}
				</Button>
			</div>
		</div>
	);
}

export default VoteCart;
