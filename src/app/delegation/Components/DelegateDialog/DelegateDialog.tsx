// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@ui/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { IoPersonAdd } from 'react-icons/io5';
import { Label } from '@/app/_shared-components/Label';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { ReactNode, useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { EConvictionAmount, EDelegationStatus, EPostOrigin, ENotificationStatus } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { Info, Loader, X } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';
import { delegateUserTracksAtom, delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { Input } from '@/app/_shared-components/Input';
import styles from './DelegateDialog.module.scss';

interface DelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string };
	children?: ReactNode;
	trackId?: number;
}

const LOCK_PERIODS = ['no lockup period', '7 days', '14 days', '28 days', '56 days', '112 days', '224 days'];

function DelegateDialog({ open, setOpen, delegate: initialDelegate, children, trackId }: DelegateDialogProps) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const router = useRouter();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const tracks = useMemo(() => Object.keys(NETWORKS_DETAILS[network].trackDetails), [network]);
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [, setDelegates] = useAtom(delegatesAtom);
	const [conviction, setConviction] = useState<EConvictionAmount>(EConvictionAmount.ZERO);
	const [balance, setBalance] = useState<string>('');
	const [isAllTracksSelected, setIsAllTracksSelected] = useState(false);
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [userBalance, setUserBalance] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<string>('');
	const [delegate, setDelegate] = useState<{ address: string }>(initialDelegate);

	const selectedTrackIds = useMemo(
		() => selectedTracks.map((track) => NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId).filter((id): id is number => id !== undefined),
		[selectedTracks, network]
	);

	const getConvictionMultiplier = (conviction: number): number => {
		if (conviction === 0) return 0.1;
		return conviction;
	};

	const isBalanceValid = useMemo(() => {
		if (!balance || balance === '0' || !userBalance) return false;

		const enteredBalance = new BN(balance);
		const multiplier = getConvictionMultiplier(conviction);
		const requiredBalance = new BN(Math.floor(Number(balance) * multiplier).toString());
		const totalRequired = txFee ? requiredBalance.add(new BN(txFee)) : requiredBalance;

		return enteredBalance.gt(new BN(0)) && totalRequired.lte(new BN(userBalance));
	}, [balance, userBalance, conviction, txFee]);

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!user) {
				router.push('/login');
			} else {
				setOpen(isOpen);
				if (isOpen) {
					setBalance('');
					if (trackId === undefined) {
						setSelectedTracks([]);
					} else {
						const trackName = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details.trackId === trackId)?.[0];

						if (trackName) {
							setSelectedTracks([trackName]);
						}
					}
					setIsAllTracksSelected(false);
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[user, trackId, network]
	);

	const toggleAllTracks = useCallback(() => {
		const availableTracks = tracks.filter((track) => {
			const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
			return !delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
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
			const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
			const isTrackDelegated = delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
			if (isTrackDelegated) {
				return;
			}
			setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]));
		},
		[network, delegateUserTracks]
	);

	const handleBalanceChange = useCallback(
		({ value }: { value: BN; assetId: string | null }) => {
			setBalance(value.toString());
		},
		[network]
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
				address: delegate.address,
				tracks: selectedTrackIds,
				conviction,
				balance: new BN(balance)
			});
			setTxFee(fee.toString());
		} catch (error) {
			console.error('Failed to calculate transaction fee:', error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, balance, selectedTrackIds, conviction, delegate.address]);

	const handleSubmit = useCallback(async () => {
		if (!apiService || !user?.defaultAddress || selectedTrackIds?.length === 0) return;

		try {
			setLoading(true);
			await apiService.delegate({
				address: user.defaultAddress,
				delegateAddress: delegate.address,
				balance: new BN(balance),
				conviction,
				tracks: selectedTrackIds,
				onSuccess: () => {
					setDelegateUserTracks((prev) => {
						const updatedTracks = [...prev];
						selectedTrackIds.forEach((trackId) => {
							const trackIndex = updatedTracks.findIndex((t) => t.trackId === trackId);

							if (trackIndex >= 0) {
								updatedTracks[trackIndex] = {
									...updatedTracks[trackIndex],
									status: EDelegationStatus.DELEGATED,
									activeProposalsCount: updatedTracks[trackIndex].activeProposalsCount
								};
							} else {
								updatedTracks.push({
									trackId,
									status: EDelegationStatus.DELEGATED,
									activeProposalsCount: 0
								});
							}
						});

						return updatedTracks;
					});

					setDelegates((prev) => {
						const delegateIndex = prev.findIndex((d) => d.address === delegate.address);

						if (delegateIndex >= 0) {
							const updatedDelegates = [...prev];
							updatedDelegates[delegateIndex] = {
								...updatedDelegates[delegateIndex],
								receivedDelegationsCount: (updatedDelegates[delegateIndex].receivedDelegationsCount || 0) + selectedTrackIds.length
							};
							return updatedDelegates;
						}

						return prev;
					});

					setOpen(false);
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
	}, [apiService, user?.defaultAddress, selectedTrackIds, delegate.address, balance, conviction]);

	useEffect(() => {
		if (user?.defaultAddress) getBalance(user.defaultAddress);
	}, [user, getBalance]);

	useEffect(() => {
		calculateTxFee();
	}, [calculateTxFee]);

	useEffect(() => {
		if (trackId) {
			const trackName = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details.trackId === trackId)?.[0];

			if (trackName) {
				setSelectedTracks([trackName]);
			}
		}
	}, [trackId, network]);

	useEffect(() => {
		const availableTracks = tracks.filter((track) => {
			const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
			return !delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
		});

		setIsAllTracksSelected(selectedTracks.length > 0 && selectedTracks.length === availableTracks.length);
	}, [selectedTracks, tracks, network, delegateUserTracks]);

	useEffect(() => {
		if (open && trackId) {
			const trackName = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details.trackId === trackId)?.[0];

			if (trackName) {
				setSelectedTracks([trackName]);
			}
		}
	}, [open, trackId, network]);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='max-w-2xl p-6'>
				<DialogHeader>
					<DialogTitle>
						<div className={styles.titleContainer}>
							<IoPersonAdd />
							<span>{t('delegate')}</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className='flex max-h-[80vh] flex-col gap-4 overflow-y-auto'>
					<Label>{t('yourAddress')}</Label>
					<AddressInput
						disabled
						className='bg-network_dropdown_bg'
						placeholder={user?.defaultAddress}
					/>

					<Label>{t('delegateTo')}</Label>
					<Input
						value={delegate.address}
						className='bg-network_dropdown_bg'
						onChange={(e) => setDelegate((prev) => ({ ...prev, address: e.target.value }))}
						placeholder={t('enterDelegateAddress')}
					/>
					{delegate.address && user?.defaultAddress === delegate.address && <p className='text-sm text-toast_error_text'>{t('youCannotDelegateToYourself')}</p>}

					<BalanceInput
						showBalance
						label={t('balance')}
						defaultValue={new BN(balance || '0')}
						onChange={handleBalanceChange}
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
								{t('xVotingBalanceForDuration')} ({LOCK_PERIODS[conviction]})
							</p>
						</div>
						{balance && (
							<div className={styles.convictionItem}>
								<p className={styles.convictionItemLabel}>{t('votes')}</p>
								<p className={styles.convictionItemLabel}>
									{balance ? (
										formatBnBalance(new BN(Math.floor(Number(balance) * getConvictionMultiplier(conviction)).toString()), { withUnit: true, numberAfterComma: 2 }, network)
									) : (
										<Skeleton className='h-4' />
									)}
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
										const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
										const isTrackDelegated = delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
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
				<DialogFooter>
					<Button
						variant='secondary'
						className='btn-cancel'
						onClick={() => setOpen(false)}
						disabled={loading}
					>
						{t('cancel')}
					</Button>
					<Button
						className='btn-delegate'
						disabled={loading || !isBalanceValid || !selectedTrackIds?.length || !delegate.address || user?.defaultAddress === delegate.address}
						onClick={handleSubmit}
					>
						{loading ? <Loader className='animate-spin' /> : t('delegate')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DelegateDialog;
