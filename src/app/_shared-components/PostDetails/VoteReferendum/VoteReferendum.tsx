// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EVoteDecision, ENotificationStatus, ISelectedAccount } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useToast } from '@/hooks/useToast';
import { Button } from '../../Button';
import BalanceInput from '../../BalanceInput/BalanceInput';
import ChooseVote from './ChooseVote/ChooseVote';
import ConvictionSelector from './ConvictionSelector/ConvictionSelector';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';

function VoteReferendum({ index }: { index: string }) {
	const { userPreferences } = useUserPreferences();
	const [voteDecision, setVoteDecision] = useState(EVoteDecision.AYE);
	const t = useTranslations();
	const [balance, setBalance] = useState<BN>(BN_ZERO);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(BN_ZERO);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(BN_ZERO);
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(BN_ZERO);
	const [conviction, setConviction] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { toast } = useToast();

	const { apiService } = usePolkadotApiService();

	const isInvalidAmount = useMemo(() => {
		return (
			([EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) && balance.lte(BN_ZERO)) ||
			(voteDecision === EVoteDecision.SPLIT_ABSTAIN && abstainVoteValue.add(ayeVoteValue).add(nayVoteValue).lte(BN_ZERO)) ||
			(voteDecision === EVoteDecision.SPLIT && ayeVoteValue.add(nayVoteValue).lte(BN_ZERO))
		);
	}, [ayeVoteValue, balance, nayVoteValue, abstainVoteValue, voteDecision]);

	const onVoteConfirm = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address) return;

		if (isInvalidAmount) return;

		try {
			const getRegularAddress = (selectedAccount: ISelectedAccount): string => {
				if (selectedAccount.parent) {
					return getRegularAddress(selectedAccount.parent);
				}
				return selectedAccount.address;
			};
			setIsLoading(true);
			await apiService.voteReferendum({
				selectedAccount: userPreferences.selectedAccount,
				address: getRegularAddress(userPreferences.selectedAccount),
				onSuccess: () => {
					toast({
						title: t('VoteReferendum.voteSuccessTitle'),
						description: t('VoteReferendum.voteSuccess'),
						status: ENotificationStatus.SUCCESS
					});
					setIsLoading(false);
				},
				onFailed: () => {
					toast({
						title: t('VoteReferendum.voteFailedTitle'),
						description: t('VoteReferendum.voteFailed'),
						status: ENotificationStatus.ERROR
					});
					setIsLoading(false);
				},
				referendumId: Number(index),
				vote: voteDecision,
				lockedBalance: balance,
				conviction,
				ayeVoteValue,
				nayVoteValue,
				abstainVoteValue
			});
		} catch (error) {
			console.error('Error voting', error);
			setIsLoading(false);
		}
	};

	return (
		<div className='flex flex-col gap-y-6'>
			<SwitchWalletOrAddress
				small
				customAddressSelector={<AddressRelationsPicker />}
			/>
			<div>
				<p className='mb-1 text-sm text-wallet_btn_text'>{t('VoteReferendum.chooseYourVote')}</p>
				<div className='flex flex-col gap-y-3'>
					<ChooseVote
						voteDecision={voteDecision}
						onVoteDecisionChange={setVoteDecision}
					/>
					<div className='flex flex-col gap-y-3'>
						{[EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) ? (
							<>
								<BalanceInput
									name={`${voteDecision}-balance`}
									label={t('VoteReferendum.lockBalance')}
									onChange={({ value }) => setBalance(value)}
								/>
								<div>
									<p className='mb-3 text-sm text-wallet_btn_text'>{t('VoteReferendum.conviction')}</p>
									<ConvictionSelector onConvictionChange={setConviction} />
								</div>
							</>
						) : (
							<>
								{voteDecision === EVoteDecision.SPLIT_ABSTAIN && (
									<BalanceInput
										label={t('VoteReferendum.abstainVoteValue')}
										onChange={({ value }) => setAbstainVoteValue(value)}
									/>
								)}
								<BalanceInput
									label={t('VoteReferendum.ayeVoteValue')}
									onChange={({ value }) => setAyeVoteValue(value)}
								/>
								<BalanceInput
									label={t('VoteReferendum.nayVoteValue')}
									onChange={({ value }) => setNayVoteValue(value)}
								/>
							</>
						)}
					</div>
				</div>
			</div>
			<div className='flex items-center justify-end gap-x-4'>
				<Button
					disabled={isInvalidAmount}
					isLoading={isLoading}
					onClick={onVoteConfirm}
					size='lg'
				>
					{t('VoteReferendum.confirm')}
				</Button>
			</div>
		</div>
	);
}

export default VoteReferendum;
