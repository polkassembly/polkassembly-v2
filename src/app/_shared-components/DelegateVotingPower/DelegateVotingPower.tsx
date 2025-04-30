// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Separator } from '@/app/_shared-components/Separator';
import { useTranslations } from 'next-intl';
import { useState, useMemo, useEffect, useCallback } from 'react';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { EConvictionAmount, EDelegationStatus, EPostOrigin, ENotificationStatus } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { Info, X } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';
import { delegateUserTracksAtom, delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import styles from './DelegateVotingPower.module.scss';
import SwitchWalletOrAddress from '../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../AddressRelationsPicker/AddressRelationsPicker';

interface DelegateDialogProps {
	delegate: { address: string };
	trackId?: number;
}

const LOCK_PERIODS = ['no lockup period', '7 days', '14 days', '28 days', '56 days', '112 days', '224 days'];

function DelegateVotingPower({ delegate: initialDelegate, trackId }: DelegateDialogProps) {
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('Delegation');
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();

	const { toast } = useToast();
	const tracks = useMemo(() => Object.keys(NETWORKS_DETAILS[`${network}`].trackDetails), [network]);
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [, setDelegates] = useAtom(delegatesAtom);
	const [conviction, setConviction] = useState<EConvictionAmount>(EConvictionAmount.ZERO);
	const [balance, setBalance] = useState<BN>();
	const [isAllTracksSelected, setIsAllTracksSelected] = useState(false);
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [userBalance, setUserBalance] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<BN | null>(null);
	const [delegateAddress, setDelegateAddress] = useState<string>(initialDelegate.address);

	const selectedTrackIds = useMemo(
		() => selectedTracks.map((track) => NETWORKS_DETAILS[`${network}`].trackDetails[track as EPostOrigin]?.trackId).filter((id): id is number => id !== undefined),
		[selectedTracks, network]
	);

	const getConvictionMultiplier = (c: number) => {
		if (c === 0) return 0.1;
		return c;
	};

	const isBalanceValid = useMemo(() => {
		if (!balance || balance.isZero() || !userBalance) return false;

		const totalRequired = txFee ? balance.add(txFee) : balance;

		return totalRequired.lte(new BN(userBalance));
	}, [balance, userBalance, txFee]);

	const toggleAllTracks = useCallback(() => {
		const availableTracks = tracks.filter((track) => {
			const id = NETWORKS_DETAILS[`${network}`].trackDetails[track as EPostOrigin]?.trackId;
			return !delegateUserTracks.some((tr) => tr.trackId === id && tr.status === EDelegationStatus.DELEGATED);
		});

		setSelectedTracks((prevSelected) => {
			if (prevSelected.length === availableTracks.length) {
				return [];
			}
			return [...availableTracks];
		});
	}, [tracks, network, delegateUserTracks]);

	const toggleTrack = useCallback(
		(track: string) => {
			const id = NETWORKS_DETAILS[`${network}`].trackDetails[track as EPostOrigin]?.trackId;
			const isTrackDelegated = delegateUserTracks.some((tr) => tr.trackId === id && tr.status === EDelegationStatus.DELEGATED);
			if (isTrackDelegated) {
				return;
			}
			setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((tr) => tr !== track) : [...prev, track]));
		},
		[network, delegateUserTracks]
	);

	const getBalance = useCallback(
		async (address: string) => {
			if (!apiService) return;

			try {
				const { totalBalance } = await apiService.getUserBalances({ address });
				setUserBalance(totalBalance.toString());
			} catch (error) {
				console.error('Failed to fetch user balance:', error);
			}
		},
		[apiService]
	);

	const calculateTxFee = useCallback(async () => {
		if (!apiService || !balance || selectedTrackIds?.length === 0) return;

		try {
			const fee = await apiService.getDelegateTxFee({
				address: delegateAddress,
				tracks: selectedTrackIds,
				conviction,
				balance: new BN(balance)
			});
			setTxFee(fee);
		} catch (error) {
			console.error('Failed to calculate transaction fee:', error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, balance, selectedTrackIds, conviction, delegateAddress]);

	const handleSubmit = useCallback(async () => {
		if (!apiService || !balance || !userPreferences?.selectedAccount?.address || selectedTrackIds?.length === 0) return;

		try {
			setLoading(true);
			await apiService.delegate({
				address: userPreferences.selectedAccount.address,
				delegateAddress,
				balance,
				conviction,
				tracks: selectedTrackIds,
				onSuccess: () => {
					setDelegateUserTracks((prev) => {
						const updatedTracks = [...prev];
						selectedTrackIds.forEach((id) => {
							const trackIndex = updatedTracks.findIndex((tr) => tr.trackId === id);

							if (trackIndex >= 0) {
								updatedTracks[`${trackIndex}`] = {
									...updatedTracks[`${trackIndex}`],
									status: EDelegationStatus.DELEGATED,
									activeProposalsCount: updatedTracks[`${trackIndex}`].activeProposalsCount
								};
							} else {
								updatedTracks.push({
									trackId: id,
									status: EDelegationStatus.DELEGATED,
									activeProposalsCount: 0
								});
							}
						});

						return updatedTracks;
					});

					setDelegates((prev) => {
						const delegateIndex = prev.findIndex((d) => d.address === delegateAddress);

						if (delegateIndex >= 0) {
							const updatedDelegates = [...prev];
							updatedDelegates[`${delegateIndex}`] = {
								...updatedDelegates[`${delegateIndex}`],
								receivedDelegationsCount: (updatedDelegates[`${delegateIndex}`].receivedDelegationsCount || 0) + selectedTrackIds.length
							};
							return updatedDelegates;
						}

						return prev;
					});

					toast({
						title: 'Delegated successfully',
						status: ENotificationStatus.SUCCESS
					});
					setLoading(false);
				},
				onFailed: (error) => {
					toast({
						title: error,
						status: ENotificationStatus.ERROR
					});
					setLoading(false);
				}
			});
		} catch (error) {
			console.error('Transaction error:', error);
			toast({
				title: 'Transaction failed',
				status: ENotificationStatus.ERROR
			});
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, userPreferences?.selectedAccount?.address, selectedTrackIds, delegateAddress, balance, conviction]);

	useEffect(() => {
		if (userPreferences?.selectedAccount?.address) getBalance(userPreferences.selectedAccount.address);
	}, [userPreferences?.selectedAccount?.address, getBalance]);

	useEffect(() => {
		calculateTxFee();
	}, [calculateTxFee]);

	useEffect(() => {
		if (trackId) {
			const trackName = Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).find(([, details]) => details.trackId === trackId)?.[0];

			if (trackName) {
				setSelectedTracks([trackName]);
			}
		}
	}, [trackId, network]);

	useEffect(() => {
		const availableTracks = tracks.filter((track) => {
			const id = NETWORKS_DETAILS[`${network}`].trackDetails[track as EPostOrigin]?.trackId;
			return !delegateUserTracks.some((tr) => tr.trackId === id && tr.status === EDelegationStatus.DELEGATED);
		});

		setIsAllTracksSelected(selectedTracks.length > 0 && selectedTracks.length === availableTracks.length);
	}, [selectedTracks, tracks, network, delegateUserTracks]);

	useEffect(() => {
		if (trackId) {
			const trackName = Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).find(([, details]) => details.trackId === trackId)?.[0];

			if (trackName) {
				setSelectedTracks([trackName]);
			}
		}
	}, [trackId, network]);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex max-h-[75vh] flex-col gap-4 overflow-y-auto'>
				<SwitchWalletOrAddress
					small
					withBalance
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>

				<div>
					<p className='mb-1 text-sm text-wallet_btn_text'>{t('delegateTo')}</p>
					<AddressInput
						value={delegateAddress}
						className='bg-network_dropdown_bg'
						onChange={(a) => setDelegateAddress(a)}
						placeholder={t('enterDelegateAddress')}
					/>
				</div>

				{delegateAddress && userPreferences?.selectedAccount?.address === delegateAddress && <p className='text-sm text-toast_error_text'>{t('youCannotDelegateToYourself')}</p>}

				<BalanceInput
					label={t('balance')}
					defaultValue={balance}
					onChange={({ value }) => setBalance(value)}
				/>
				<div className='w-full'>
					<p className='mb-3 text-sm text-wallet_btn_text'>{t('conviction')}</p>
					<ConvictionSelector onConvictionChange={setConviction} />
				</div>
				<div className={styles.convictionContainer}>
					<div className={styles.convictionItem}>
						<p className={styles.convictionItemLabel}>{t('lockPeriod')}</p>
						<p className={styles.convictionItemLabel}>
							{conviction}
							{t('xVotingBalanceForDuration')} ({LOCK_PERIODS[`${conviction}`]})
						</p>
					</div>
					{balance && (
						<div className={styles.convictionItem}>
							<p className={styles.convictionItemLabel}>{t('votes')}</p>
							<p className={styles.convictionItemLabel}>
								{formatBnBalance(new BN(balance.toNumber() * getConvictionMultiplier(conviction)), { withUnit: true, numberAfterComma: 2 }, network)}
							</p>
						</div>
					)}
				</div>

				<div className='flex flex-col gap-4'>
					<Tooltip>
						<div className={styles.selectedTracksContainer}>
							<p className='text-sm text-wallet_btn_text'>{t('selectedTrack')}</p>
							<div className='flex cursor-pointer items-center gap-2'>
								<Checkbox
									checked={isAllTracksSelected}
									onCheckedChange={toggleAllTracks}
								/>
								<TooltipTrigger asChild>
									<span className='text-sm text-wallet_btn_text'>{t('delegateToAllAvailableTracks')}</span>
								</TooltipTrigger>
							</div>
						</div>

						<TooltipContent
							side='top'
							align='center'
							sideOffset={10}
							className={cn(styles.tooltipContent, 'bg-bg_modal')}
						>
							<div className='flex flex-col gap-2'>
								{tracks.map((track) => {
									const id = NETWORKS_DETAILS[`${network}`].trackDetails[track as EPostOrigin]?.trackId;
									const isTrackDelegated = delegateUserTracks.some((tr) => tr.trackId === id && tr.status === EDelegationStatus.DELEGATED);
									const isChecked = isTrackDelegated || selectedTracks.includes(track);

									return (
										<div
											key={track}
											className={cn(styles.tooltipContentData, isChecked ? 'bg-page_background' : '')}
										>
											<Checkbox
												checked={isChecked}
												onCheckedChange={() => toggleTrack(track)}
												disabled={isTrackDelegated}
												className={styles.checkbox}
											/>
											<span className={isTrackDelegated ? 'text-text_secondary' : ''}>
												{track} {isTrackDelegated && '(Already delegated)'}
											</span>
										</div>
									);
								})}
							</div>
						</TooltipContent>
					</Tooltip>
					<div className='flex flex-wrap gap-2'>
						{selectedTracks.map((track) => (
							<span
								key={track}
								className={styles.track}
							>
								{track}
								<X
									className='h-3 w-3 cursor-pointer'
									onClick={() => toggleTrack(track)}
								/>
							</span>
						))}
					</div>
				</div>
				{selectedTrackIds?.length > 0 && txFee && (
					<Alert
						variant='info'
						className='flex items-center gap-2'
					>
						<Info className='h-4 w-4' />
						<p>
							{t('anApproximateFeesOf')} {formatBnBalance(txFee, { withUnit: true, numberAfterComma: 4 }, network)} {t('willBeAppliedToTheTransaction')}
						</p>
					</Alert>
				)}
			</div>
			<Separator
				className='mt-5 w-full'
				orientation='horizontal'
			/>
			<div className='flex items-center justify-end gap-2'>
				<Button
					className='btn-delegate'
					isLoading={loading}
					disabled={!isBalanceValid || !selectedTrackIds?.length || !delegateAddress || userPreferences?.selectedAccount?.address === delegateAddress}
					onClick={handleSubmit}
				>
					{t('delegate')}
				</Button>
			</div>
		</div>
	);
}

export default DelegateVotingPower;
