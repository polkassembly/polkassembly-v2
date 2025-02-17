// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IVoteCartItem } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import React, { useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import CartItem from './CartItem';

function VoteCart({ voteCart }: { voteCart: IVoteCartItem[] }) {
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations();

	const [loading, setLoading] = useState<boolean>(false);

	const confirmBatchVoting = async () => {
		if (!userPreferences.address?.address || voteCart.length === 0) return;

		setLoading(true);
		await apiService?.batchVoteReferendum({
			address: userPreferences.address.address,
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
			<div className='flex max-h-[300px] flex-1 flex-col gap-y-2 overflow-y-auto'>
				{voteCart.length > 0 ? (
					voteCart.map((item) => (
						<CartItem
							key={item.postIndexOrHash}
							voteCartItem={item}
						/>
					))
				) : (
					<div className='flex flex-col items-center justify-center gap-y-2'>
						<p>{t('BatchVote.noItemsInVoteCart')}</p>
					</div>
				)}
			</div>
			<div>
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
