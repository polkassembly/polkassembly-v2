// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EVoteDecision, NotificationStatus } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Ban, Split, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_COLORS } from '@/app/_style/theme';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useToast } from '@/hooks/useToast';
import AddressDropdown from '../../AddressDropdown/AddressDropdown';
import WalletButtons from '../../WalletsUI/WalletButtons/WalletButtons';
import { Tabs, TabsList, TabsTrigger } from '../../Tabs';
import classes from './VoteReferendum.module.scss';
import { Slider } from '../../Slider';
import { Button } from '../../Button';
import BalanceInput from '../../BalanceInput/BalanceInput';

function VoteReferendum({ index }: { index: string }) {
	const { setUserPreferences, userPreferences } = useUserPreferences();
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
			(voteDecision === EVoteDecision.ABSTAIN && abstainVoteValue.add(ayeVoteValue).add(nayVoteValue).lte(BN_ZERO)) ||
			(voteDecision === EVoteDecision.SPLIT && ayeVoteValue.add(nayVoteValue).lte(BN_ZERO))
		);
	}, [ayeVoteValue, balance, nayVoteValue, abstainVoteValue, voteDecision]);

	const onVoteConfirm = async () => {
		if (!apiService || !userPreferences.address?.address) return;

		if (isInvalidAmount) return;

		try {
			setIsLoading(true);
			await apiService.voteReferendum({
				address: userPreferences.address?.address ?? '',
				onSuccess: () => {
					toast({
						title: 'Vote successful',
						description: 'Your vote has been cast successfully',
						status: NotificationStatus.SUCCESS
					});
					setIsLoading(false);
				},
				onFailed: () => {
					toast({
						title: 'Vote failed',
						description: 'Your vote has not been cast successfully',
						status: NotificationStatus.ERROR
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
			<WalletButtons
				small
				onWalletChange={(wallet) => setUserPreferences({ ...userPreferences, wallet: wallet ?? undefined })}
			/>
			<AddressDropdown
				withBalance
				onChange={(a) => setUserPreferences({ ...userPreferences, address: a })}
			/>
			<div>
				<p className='mb-1 text-sm text-wallet_btn_text'>{t('VoteReferendum.chooseYourVote')}</p>
				<Tabs
					defaultValue={voteDecision}
					onValueChange={(tab) => setVoteDecision(tab as EVoteDecision)}
					className='flex flex-col gap-y-3'
				>
					<TabsList className='flex gap-x-2 rounded border border-border_grey p-1'>
						<TabsTrigger
							className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-success data-[state=active]:text-white')}
							value={EVoteDecision.AYE}
						>
							<ThumbsUp
								fill={voteDecision === EVoteDecision.AYE ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
								className='h-4 w-4'
							/>
							{t('PostDetails.aye')}
						</TabsTrigger>
						<TabsTrigger
							className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-failure data-[state=active]:text-white')}
							value={EVoteDecision.NAY}
						>
							<ThumbsDown
								fill={voteDecision === EVoteDecision.NAY ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
								className='h-4 w-4'
							/>
							{t('PostDetails.nay')}
						</TabsTrigger>
						<TabsTrigger
							className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-yellow_primary data-[state=active]:text-white')}
							value={EVoteDecision.SPLIT}
						>
							<Split className='h-4 w-4' />
							{t('PostDetails.split')}
						</TabsTrigger>
						<TabsTrigger
							className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-decision_bar_indicator data-[state=active]:text-white')}
							value={EVoteDecision.ABSTAIN}
						>
							<Ban className='h-4 w-4' />
							{t('PostDetails.abstain')}
						</TabsTrigger>
					</TabsList>
					<div className='flex flex-col gap-y-3'>
						{[EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) ? (
							<>
								<BalanceInput
									name={`${voteDecision}-balance`}
									label={t('VoteReferendum.lockBalance')}
									onChange={setBalance}
								/>
								<div>
									<p className='mb-3 text-sm text-wallet_btn_text'>{t('VoteReferendum.conviction')}</p>
									<Slider
										max={6}
										step={1}
										defaultValue={[0]}
										onValueChange={(value) => setConviction(value[0])}
										withBottomIndicator
									/>
								</div>
							</>
						) : (
							<>
								{voteDecision === EVoteDecision.ABSTAIN && (
									<BalanceInput
										label={t('VoteReferendum.abstainVoteValue')}
										onChange={setAbstainVoteValue}
									/>
								)}
								<BalanceInput
									label={t('VoteReferendum.ayeVoteValue')}
									onChange={setAyeVoteValue}
								/>
								<BalanceInput
									label={t('VoteReferendum.nayVoteValue')}
									onChange={setNayVoteValue}
								/>
							</>
						)}
					</div>
				</Tabs>
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
