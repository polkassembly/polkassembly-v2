// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EConvictionAmount, EVoteDecision } from '@/_shared/types';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Button } from '@/app/_shared-components/Button';
import ChooseVote from '@/app/_shared-components/PostDetails/VoteReferendum/ChooseVote/ChooseVote';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { Separator } from '@/app/_shared-components/Separator';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
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
	onNext,
	isInvalidAmount
}: {
	voteDecision: EVoteDecision;
	onVoteDecisionChange: (voteDecision: EVoteDecision) => void;
	onConvictionChange: (conviction: EConvictionAmount) => void;
	onDefaultAyeNayValueChange: (ayeVoteValue: BN) => void;
	onDefaultAbstainValueChange: (abstainVoteValue: BN) => void;
	onDefaultAbstainAyeValueChange: (ayeVoteValue: BN) => void;
	onDefaultAbstainNayValueChange: (nayVoteValue: BN) => void;
	onNext: () => void;
	isInvalidAmount: boolean;
}) {
	const t = useTranslations();
	return (
		<div>
			<div className='p-4'>{t('BatchVote.setDefaults')}</div>
			<Separator />
			<div className='flex w-full flex-col items-center gap-y-4 p-4'>
				<WalletButtons small />
				<AddressDropdown withBalance />
				<div className='flex w-full items-center gap-x-4'>
					<div className='w-full'>
						<p className='mb-1 text-sm text-wallet_btn_text'>{t('BatchVote.chooseYourVote')}</p>
						<ChooseVote
							voteDecision={voteDecision}
							onVoteDecisionChange={onVoteDecisionChange}
							removeSplit
						/>
					</div>
					<div className='w-full'>
						<p className='mb-3 text-sm text-wallet_btn_text'>{t('BatchVote.setConviction')}</p>
						<ConvictionSelector onConvictionChange={onConvictionChange} />
					</div>
				</div>
				<div className='flex w-full flex-wrap gap-4'>
					{[EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) ? (
						<div className='w-1/2'>
							<BalanceInput
								name={`${voteDecision}-balance`}
								label={t('VoteReferendum.lockBalance')}
								onChange={onDefaultAyeNayValueChange}
							/>
						</div>
					) : (
						<>
							{voteDecision === EVoteDecision.ABSTAIN && (
								<div className='flex-1'>
									<BalanceInput
										label={t('VoteReferendum.abstainVoteValue')}
										onChange={onDefaultAbstainValueChange}
									/>
								</div>
							)}
							<div className='flex-1'>
								<BalanceInput
									label={t('VoteReferendum.ayeVoteValue')}
									onChange={onDefaultAbstainAyeValueChange}
								/>
							</div>
							<div className='flex-1'>
								<BalanceInput
									label={t('VoteReferendum.nayVoteValue')}
									onChange={onDefaultAbstainNayValueChange}
								/>
							</div>
						</>
					)}
				</div>
				<Separator />
				<div className='flex w-full justify-end'>
					<Button
						onClick={onNext}
						disabled={isInvalidAmount}
					>
						{t('BatchVote.next')}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default SetDefaults;
