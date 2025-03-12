// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EConvictionAmount, EReactQueryKeys, EVoteDecision, IVoteCartItem } from '@/_shared/types';
import { BatchVotingClientService } from '@/app/_client-services/batch_voting_client_service';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Button } from '@/app/_shared-components/Button';
import ChooseVote from '@/app/_shared-components/PostDetails/VoteReferendum/ChooseVote/ChooseVote';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { BN, BN_ZERO } from '@polkadot/util';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

function EditCartItem({ voteCartItem, onClose }: { voteCartItem: IVoteCartItem; onClose?: () => void }) {
	const t = useTranslations();
	const [voteDecision, setVoteDecision] = useState<EVoteDecision>(voteCartItem.decision);
	const [ayeNayValue, setAyeNayValue] = useState<BN>(new BN(voteCartItem.decision === EVoteDecision.AYE ? voteCartItem.amount.aye || BN_ZERO : voteCartItem.amount.nay || BN_ZERO));
	const [abstainAyeValue, setAbstainAyeValue] = useState<BN>(new BN(voteCartItem.amount.aye || BN_ZERO));
	const [abstainNayValue, setAbstainNayValue] = useState<BN>(new BN(voteCartItem.amount.nay || BN_ZERO));
	const [abstainValue, setAbstainValue] = useState<BN>(new BN(voteCartItem.amount.abstain || BN_ZERO));
	const [conviction, setConviction] = useState<EConvictionAmount>(voteCartItem.conviction);

	const [loading, setLoading] = useState(false);

	const { user } = useUser();
	const queryClient = useQueryClient();

	const editVoteCartItem = async () => {
		if (!user?.id) return;

		setLoading(true);

		const amount = BatchVotingClientService.getAmountForDecision({
			voteDecision,
			ayeNayValue,
			abstainValue,
			abstainAyeValue,
			abstainNayValue
		});

		const { data, error } = await BatchVotingClientService.editBatchVoteCartItem({ userId: user.id, id: voteCartItem.id, decision: voteDecision, amount, conviction });
		if (error || !data) {
			setLoading(false);
			console.error(error);
			return;
		}

		queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], (oldData: IVoteCartItem[]) => {
			return oldData.map((item) => (item.id === voteCartItem.id ? { ...item, decision: voteDecision, amount, conviction } : item));
		});

		setLoading(false);
		onClose?.();
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<ChooseVote
				voteDecision={voteCartItem.decision}
				onVoteDecisionChange={setVoteDecision}
				removeSplit
			/>
			<div className='flex flex-col gap-y-3'>
				{[EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) ? (
					<BalanceInput
						name={`${voteDecision}-balance`}
						label={t('VoteReferendum.lockBalance')}
						onChange={({ value }) => setAyeNayValue(value)}
					/>
				) : (
					<>
						{voteDecision === EVoteDecision.SPLIT_ABSTAIN && (
							<BalanceInput
								label={t('VoteReferendum.abstainVoteValue')}
								onChange={({ value }) => setAbstainValue(value)}
							/>
						)}
						<BalanceInput
							label={t('VoteReferendum.ayeVoteValue')}
							onChange={({ value }) => setAbstainAyeValue(value)}
						/>
						<BalanceInput
							label={t('VoteReferendum.nayVoteValue')}
							onChange={({ value }) => setAbstainNayValue(value)}
						/>
					</>
				)}
				<div>
					<p className='mb-3 text-sm text-wallet_btn_text'>{t('VoteReferendum.conviction')}</p>
					<ConvictionSelector
						onConvictionChange={setConviction}
						defaultConviction={voteCartItem.conviction}
					/>
				</div>
			</div>
			<Separator />
			<div className='flex justify-end'>
				<Button
					isLoading={loading}
					onClick={editVoteCartItem}
				>
					{t('BatchVote.save')}
				</Button>
			</div>
		</div>
	);
}

export default EditCartItem;
