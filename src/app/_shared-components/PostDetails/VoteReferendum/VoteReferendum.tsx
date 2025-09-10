// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EVoteDecision, ENotificationStatus, EPostOrigin, EProposalType, EReactQueryKeys, IVoteHistoryData } from '@/_shared/types';
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
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { Ban, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
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

	const { toast } = useToast();

	const t = useTranslations();

	const onAddCommentAfterVoteSuccess = () => {
		if (!index || !proposalType) return;

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
						onOptimisticUpdate={onAddCommentAfterVoteSuccess}
						voteData={{
							decision,
							balanceValue: balance.toString(),
							voterAddress: address,
							lockPeriod: conviction,
							createdAt: new Date()
						}}
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
	const queryClient = useQueryClient();
	const [balance, setBalance] = useState<BN>(BN_ZERO);
	const [ayeVoteValue, setAyeVoteValue] = useState<BN>(BN_ZERO);
	const [nayVoteValue, setNayVoteValue] = useState<BN>(BN_ZERO);
	const [abstainVoteValue, setAbstainVoteValue] = useState<BN>(BN_ZERO);
	const [conviction, setConviction] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { toast } = useToast();
	const network = getCurrentNetwork();

	const { user } = useUser();

	const { setVaultQrState } = usePolkadotVault();

	const [reuseLock, setReuseLock] = useState<BN | null>(null);

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

	const fetchAddressGovernanceLock = async () => {
		if (!userPreferences.selectedAccount?.address || !apiService) return null;

		return apiService.getAddressGovernanceLock({ address: userPreferences.selectedAccount.address });
	};

	const { data: governanceLock } = useQuery({
		queryKey: ['governanceLock', userPreferences.selectedAccount?.address],
		queryFn: fetchAddressGovernanceLock,
		enabled: !!userPreferences.selectedAccount?.address && !!apiService
	});

	const fetchAddressLockedBalance = async () => {
		if (!userPreferences.selectedAccount?.address || !apiService) return null;
		const balances = await apiService.getUserBalances({ address: userPreferences.selectedAccount.address });
		return balances.lockedBalance;
	};

	const { data: lockedBalance } = useQuery({
		queryKey: ['lockedBalance', userPreferences.selectedAccount?.address],
		queryFn: fetchAddressLockedBalance,
		enabled: !!userPreferences.selectedAccount?.address && !!apiService
	});

	const fetchExistingVote = async () => {
		if (!userPreferences.selectedAccount?.address) return null;
		const { data, error } = await NextApiClientService.getPostVotesByAddresses({
			proposalType,
			index,
			addresses: [userPreferences.selectedAccount.address]
		});
		if (error) throw new Error(error.message || 'Failed to fetch vote data');
		if (!data) return null;
		return data;
	};

	const { data: existingVoteData } = useQuery({
		queryKey: ['existingVote', userPreferences.selectedAccount?.address, index],
		queryFn: fetchExistingVote,
		enabled: !!userPreferences.selectedAccount?.address
	});

	const existingVote = useMemo(() => {
		if (!existingVoteData?.votes?.length) return null;
		return existingVoteData.votes[0];
	}, [existingVoteData]);

	const isInvalidAmount = useMemo(() => {
		return (
			([EVoteDecision.AYE, EVoteDecision.NAY].includes(voteDecision) && balance.lte(BN_ZERO)) ||
			(voteDecision === EVoteDecision.SPLIT_ABSTAIN && abstainVoteValue.add(ayeVoteValue).add(nayVoteValue).lte(BN_ZERO)) ||
			(voteDecision === EVoteDecision.SPLIT && ayeVoteValue.add(nayVoteValue).lte(BN_ZERO))
		);
	}, [ayeVoteValue, balance, nayVoteValue, abstainVoteValue, voteDecision]);

	const onVoteConfirm = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !userPreferences.wallet || !user?.id) return;

		if (isInvalidAmount) return;

		const userAddress = userPreferences.selectedAccount.address;

		try {
			setIsLoading(true);

			await apiService.voteReferendum({
				selectedAccount: userPreferences.selectedAccount,
				wallet: userPreferences.wallet,
				setVaultQrState,
				address: userAddress,
				onSuccess: () => {
					toast({
						title: t('VoteReferendum.voteSuccessTitle'),
						description: t('VoteReferendum.voteSuccess'),
						status: ENotificationStatus.SUCCESS
					});
					setIsLoading(false);

					// Optimistic update - immediately update cache with new vote on success
					const optimisticVoteData = {
						decision: voteDecision,
						balanceValue: balance.toString(),
						voterAddress: userAddress,
						lockPeriod: conviction,
						createdAt: new Date(),
						selfVotingPower: balance.toString(),
						totalVotingPower: balance.toString(),
						delegatedVotingPower: '0'
					};

					queryClient.setQueryData([EReactQueryKeys.USER_VOTES, proposalType, index, user.id], (oldData: IVoteHistoryData) => {
						const existingVotes = oldData?.votes || [];
						const addressIndex = existingVotes.findIndex((vote) => getSubstrateAddress(vote.voterAddress) === getSubstrateAddress(userAddress));

						if (addressIndex !== -1) {
							// Replace existing vote for this address
							const updatedVotes = [...existingVotes];
							updatedVotes[`${addressIndex}`] = optimisticVoteData;
							return { votes: updatedVotes };
						}
						// Add new vote
						return { votes: [optimisticVoteData, ...existingVotes] };
					});

					onClose();
					setOpenSuccessModal(true);
					setSuccessModalContent(
						<VoteSuccessContent
							decision={voteDecision}
							balance={balance}
							address={userAddress}
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
		<div className='flex max-h-[80vh] flex-col gap-y-6'>
			<SwitchWalletOrAddress
				small
				customAddressSelector={
					<AddressRelationsPicker
						withBalance
						showVotingBalance
					/>
				}
			/>
			<div className='flex flex-1 flex-col gap-y-6 overflow-y-auto'>
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
									<div className='flex flex-col gap-y-1'>
										<BalanceInput
											name={`${voteDecision}-balance`}
											label={t('VoteReferendum.lockBalance')}
											onChange={({ value }) => {
												setBalance(value);
												setReuseLock(null);
											}}
											value={reuseLock && reuseLock.gt(BN_ZERO) ? reuseLock : undefined}
										/>
										<div className='flex flex-col items-center gap-2 sm:flex-row'>
											{governanceLock && governanceLock.gt(BN_ZERO) && (
												<Button
													variant='ghost'
													size='sm'
													className='flex items-center gap-x-1 rounded-md bg-page_background text-xs text-delegation_card_text'
													onClick={() => {
														setBalance(governanceLock);
														setReuseLock(governanceLock);
													}}
												>
													<span className='font-medium'>{t('VoteReferendum.reuseGovernanceLock')}</span>
													<span className='font-bold'>{formatBnBalance(governanceLock, { withUnit: true, compactNotation: true }, network)}</span>
												</Button>
											)}
											{lockedBalance && lockedBalance.gt(BN_ZERO) && (
												<Button
													variant='ghost'
													size='sm'
													className='flex items-center gap-x-1 rounded-md bg-page_background text-xs text-delegation_card_text'
													onClick={() => {
														setBalance(lockedBalance);
														setReuseLock(lockedBalance);
													}}
												>
													<span className='font-medium'>{t('VoteReferendum.reuseAllLocks')}</span>
													<span className='font-bold'>{formatBnBalance(lockedBalance, { withUnit: true, compactNotation: true }, network)}</span>
												</Button>
											)}
										</div>
									</div>
									<div>
										<p className='mb-3 text-sm text-wallet_btn_text'>{t('VoteReferendum.conviction')}</p>
										<ConvictionSelector
											onConvictionChange={setConviction}
											voteBalance={balance}
										/>
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
				{existingVote && (
					<div className='flex flex-col gap-y-3 rounded-xl bg-info_bg p-4'>
						<p className='text-sm font-semibold text-text_primary'>{t('VoteReferendum.existingVote')}</p>
						<p className='text-sm text-basic_text'>{t('VoteReferendum.existingVoteDescription')}</p>
						<div className='flex items-center justify-between'>
							<h3 className='flex items-center gap-1 text-base font-semibold text-text_primary'>
								{existingVote.decision === EVoteDecision.ABSTAIN && <Ban className='h-4 w-4 text-basic_text' />}
								{existingVote.decision === EVoteDecision.AYE && <ThumbsUp className='h-4 w-4 text-basic_text' />}
								{existingVote.decision === EVoteDecision.NAY && <ThumbsDown className='h-4 w-4 text-basic_text' />}
								{t(`PostDetails.${existingVote.decision}`)}
							</h3>

							<p className='text-sm text-basic_text'>
								{formatBnBalance(
									existingVote.selfVotingPower || '0',
									{
										withUnit: true,
										numberAfterComma: 2,
										compactNotation: true
									},
									network
								)}{' '}
								({!existingVote.lockPeriod || existingVote.lockPeriod === 0 ? 0.1 : existingVote.lockPeriod}x)
							</p>
						</div>
					</div>
				)}
			</div>

			<div className='flex items-center justify-end gap-x-4'>
				<Button
					disabled={isInvalidAmount}
					isLoading={isLoading}
					onClick={onVoteConfirm}
					size='lg'
				>
					{existingVote ? t('VoteReferendum.changeVote') : t('VoteReferendum.confirm')}
				</Button>
			</div>
		</div>
	);
}

export default VoteReferendum;
