// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import {
	EVoteDecision,
	ENotificationStatus,
	ISelectedAccount,
	EPostOrigin,
	IComment,
	IPublicUser,
	EProposalType,
	ICommentResponse,
	IVoteData,
	EReactQueryKeys
} from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useToast } from '@/hooks/useToast';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { cn } from '@/lib/utils';
import { Button } from '../../Button';
import BalanceInput from '../../BalanceInput/BalanceInput';
import ChooseVote from './ChooseVote/ChooseVote';
import ConvictionSelector from './ConvictionSelector/ConvictionSelector';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import Address from '../../Profile/Address/Address';
import AddComment from '../../PostComments/AddComment/AddComment';

function VoteSuccessContent({
	decision,
	balance,
	address,
	conviction,
	proposalType,
	index,
	onClose
}: {
	decision: EVoteDecision;
	balance: BN;
	address: string;
	conviction: number;
	proposalType: EProposalType;
	index: string;
	onClose: () => void;
}) {
	const network = getCurrentNetwork();

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const t = useTranslations();

	const onAddCommentAfterVoteSuccess = (newComment: IComment, publicUser: Omit<IPublicUser, 'rank'>) => {
		if (!index || !proposalType) return;

		const voteData: IVoteData = {
			decision,
			balanceValue: balance.toString(),
			voterAddress: address,
			lockPeriod: conviction,
			createdAt: new Date()
		};

		queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, index], (prev: ICommentResponse[]) => [
			...(prev || []),
			{ ...newComment, user: publicUser, voteData: [voteData] }
		]);
		toast({
			title: t('VoteReferendum.commentSuccessTitle'),
			description: t('VoteReferendum.commentSuccess'),
			status: ENotificationStatus.SUCCESS
		});
		onClose();
	};

	return (
		<div className='max-w-full'>
			<div className='mb-6 flex flex-col items-center gap-y-2'>
				<p className='flex items-center gap-x-2 text-sm font-medium text-text_primary'>
					<span className='text-xl font-semibold'>{t('VoteReferendum.voted')}</span>
					<span
						className={cn(
							'text-xl font-semibold capitalize',
							decision === EVoteDecision.AYE ? 'text-success' : decision === EVoteDecision.NAY ? 'text-failure' : 'text-text_primary'
						)}
					>
						{decision === EVoteDecision.SPLIT_ABSTAIN ? EVoteDecision.ABSTAIN : decision}
					</span>
					<span className='text-xl font-semibold'>{t('VoteReferendum.successfully')}</span>
					<span className='text-wallet_btn_text'>{t('VoteReferendum.with')}</span>
					<Address address={address} />
				</p>
				<p className='flex items-center gap-x-2 text-sm font-medium text-text_primary'>
					<span className='text-base font-semibold text-text_primary'>
						{conviction !== 0 ? `${conviction}x` : '0.1x'} {t('VoteReferendum.conviction')}
					</span>
					<span className='text-wallet_btn_text'>{t('VoteReferendum.with')}</span>
					<span className='text-xl font-semibold text-text_pink'>{formatBnBalance(balance, { withUnit: true, compactNotation: true }, network)}</span>
				</p>
			</div>
			<div className='max-w-full'>
				<p className='mb-1 flex flex-wrap items-center gap-x-1 whitespace-break-spaces text-sm text-wallet_btn_text'>
					{t('VoteReferendum.your')} <span className='font-medium capitalize text-text_pink'>{decision === EVoteDecision.SPLIT_ABSTAIN ? EVoteDecision.ABSTAIN : decision}</span>{' '}
					{t('VoteReferendum.voteIsIn')}
				</p>
				<div className='max-w-[80vw]'>
					<AddComment
						proposalIndex={index}
						proposalType={proposalType}
						onConfirm={onAddCommentAfterVoteSuccess}
					/>
				</div>
			</div>
		</div>
	);
}

function VoteReferendum({ index, track, onClose, proposalType }: { index: string; track?: EPostOrigin; onClose: () => void; proposalType: EProposalType }) {
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
	const network = getCurrentNetwork();

	const { setOpenSuccessModal, setSuccessModalContent } = useSuccessModal();

	const trackId = track ? NETWORKS_DETAILS[`${network}`].trackDetails[`${track}`]?.trackId : undefined;

	const { apiService } = usePolkadotApiService();

	const fetchReceivedDelegation = async () => {
		if (!userPreferences.selectedAccount?.address || !trackId) return null;

		const { data, error } = await NextApiClientService.getDelegateTrack({ address: userPreferences.selectedAccount.address, trackId });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to get delegations');
		}

		return data.receivedDelegations;
	};

	const { data: receivedDelegations } = useQuery({
		queryKey: ['receivedDelegation', userPreferences.selectedAccount?.address, trackId],
		queryFn: fetchReceivedDelegation,
		enabled: !!userPreferences.selectedAccount?.address && !!trackId,
		placeholderData: (prev) => prev,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true
	});

	const delegatedVotingPower = useMemo(() => {
		if (!receivedDelegations) return BN_ZERO;
		return receivedDelegations.reduce((acc, curr) => {
			const delegatedBalance = new BN(curr.balance);
			return acc.add(curr.lockPeriod ? delegatedBalance.mul(new BN(curr.lockPeriod)) : delegatedBalance.div(new BN('10')));
		}, BN_ZERO);
	}, [receivedDelegations]);

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
					onClose();
					setOpenSuccessModal(true);
					setSuccessModalContent(
						<VoteSuccessContent
							decision={voteDecision}
							balance={balance}
							address={userPreferences.selectedAccount ? getRegularAddress(userPreferences.selectedAccount) : ''}
							conviction={conviction}
							proposalType={proposalType}
							index={index}
							onClose={() => {
								setOpenSuccessModal(false);
							}}
						/>
					);
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
				customAddressSelector={<AddressRelationsPicker withBalance />}
			/>
			{delegatedVotingPower && delegatedVotingPower.gt(BN_ZERO) && (
				<BalanceInput
					defaultValue={new BN(delegatedVotingPower.toString())}
					disabled
					label={t('VoteReferendum.delegatedPower')}
				/>
			)}
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
