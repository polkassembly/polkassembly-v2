// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EConvictionAmount, EVoteDecision } from '@/_shared/types';
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Button } from '@/app/_shared-components/Button';
import ChooseVote from '@/app/_shared-components/PostDetails/VoteReferendum/ChooseVote/ChooseVote';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { Separator } from '@/app/_shared-components/Separator';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import React from 'react';

function SetDefaults({
	voteDecision,
	onVoteDecisionChange,
	onConvictionChange,
	onDefaultAyeNayValueChange,
	onDefaultAbstainValueChange,
	onDefaultAbstainAyeValueChange,
	onDefaultAbstainNayValueChange,
	onNext
}: {
	voteDecision: EVoteDecision;
	onVoteDecisionChange: (voteDecision: EVoteDecision) => void;
	onConvictionChange: (conviction: EConvictionAmount) => void;
	onDefaultAyeNayValueChange: (ayeVoteValue: BN) => void;
	onDefaultAbstainValueChange: (abstainVoteValue: BN) => void;
	onDefaultAbstainAyeValueChange: (ayeVoteValue: BN) => void;
	onDefaultAbstainNayValueChange: (nayVoteValue: BN) => void;
	onNext: () => void;
}) {
	const t = useTranslations();
	return (
		<div>
			<div className='p-4'>{t('BatchVote.setDefaults')}</div>
			<Separator />
			<div className='flex w-full flex-col gap-y-4 px-24 py-4'>
				<SwitchWalletOrAddress
					small
					withBalance
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>

				<div className='w-full'>
					<p className='mb-1 text-xs text-wallet_btn_text sm:text-sm'>{t('BatchVote.chooseYourVote')}</p>
					<ChooseVote
						voteDecision={voteDecision}
						onVoteDecisionChange={onVoteDecisionChange}
						removeSplit
					/>
				</div>
				<div className='flex w-full flex-col gap-y-4'>
					{[EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) ? (
						<BalanceInput
							name={`${voteDecision}-balance`}
							label={t('VoteReferendum.lockBalance')}
							onChange={({ value }) => onDefaultAyeNayValueChange(value)}
						/>
					) : (
						<>
							{voteDecision === EVoteDecision.SPLIT_ABSTAIN && (
								<BalanceInput
									label={t('VoteReferendum.abstainVoteValue')}
									onChange={({ value }) => onDefaultAbstainValueChange(value)}
								/>
							)}
							<BalanceInput
								label={t('VoteReferendum.ayeVoteValue')}
								onChange={({ value }) => onDefaultAbstainAyeValueChange(value)}
							/>
							<BalanceInput
								label={t('VoteReferendum.nayVoteValue')}
								onChange={({ value }) => onDefaultAbstainNayValueChange(value)}
							/>
						</>
					)}
				</div>
				<div className='w-full'>
					<p className='mb-3 text-sm text-wallet_btn_text'>{t('BatchVote.setConviction')}</p>
					<ConvictionSelector onConvictionChange={onConvictionChange} />
				</div>
				<Separator />
				<div className='flex w-full justify-end'>
					<Button onClick={onNext}>{t('BatchVote.next')}</Button>
				</div>
			</div>
		</div>
	);
}

export default SetDefaults;
