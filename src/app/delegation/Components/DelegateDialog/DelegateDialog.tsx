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
import { EConvictionAmount, EDelegationStatus, EPostOrigin, NotificationType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Checkbox } from '@/app/_shared-components/checkbox';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { Info, Loader, X } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';
import { delegateUserTracksAtom, delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/useToast';

interface DelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string };
	children?: ReactNode;
}

const LOCK_PERIODS = ['no lockup period', '7 days', '14 days', '28 days', '56 days', '112 days', '224 days'];

function DelegateDialog({ open, setOpen, delegate, children }: DelegateDialogProps) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const router = useRouter();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { toast } = useToast();

	const tracks = useMemo(() => Object.keys(NETWORKS_DETAILS[network].trackDetails), [network]);
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [delegates, setDelegates] = useAtom(delegatesAtom);

	const [conviction, setConviction] = useState<EConvictionAmount>(EConvictionAmount.ZERO);
	const [balance, setBalance] = useState<string>('');
	const [isAllTracksSelected, setIsAllTracksSelected] = useState(false);
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [userBalance, setUserBalance] = useState<string | null>(null);
	const [isBalanceError, setIsBalanceError] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<string>('');

	const selectedTrackIds = useMemo(
		() => selectedTracks.map((track) => NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId).filter((id): id is number => id !== undefined),
		[selectedTracks, network]
	);

	const isValidDelegate = useMemo(() => delegates.some((d) => d.address === delegate.address), [delegates, delegate.address]);

	const isBalanceValid = useMemo(() => {
		if (!balance || balance === '0' || !userBalance) return false;

		const enteredBalance = new BN(balance);
		const requiredBalance = enteredBalance.muln(conviction + 1);
		const totalRequired = txFee ? requiredBalance.add(new BN(txFee)) : requiredBalance;

		return enteredBalance.gt(new BN(0)) && totalRequired.lte(new BN(userBalance));
	}, [balance, userBalance, conviction, txFee]);

	useEffect(() => {
		setIsBalanceError(balance !== '' && !isBalanceValid);
	}, [balance, isBalanceValid]);

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!user) {
				router.push('/login');
			} else {
				setOpen(isOpen);
				if (isOpen) {
					setBalance('');
					setIsBalanceError(false);
					setSelectedTracks([]);
					setIsAllTracksSelected(false);
				}
			}
		},
		[user, router, setOpen]
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

			// Skip if already delegated
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
		if (!apiService || !user?.defaultAddress || !balance || selectedTrackIds?.length === 0) return;

		try {
			const fee = await apiService.getDelegateTxFee({
				address: user.defaultAddress,
				tracks: selectedTrackIds,
				conviction,
				balance: new BN(balance)
			});
			setTxFee(fee.toString());
		} catch (error) {
			console.error('Failed to calculate transaction fee:', error);
		}
	}, [apiService, user?.defaultAddress, balance, selectedTrackIds, conviction]);

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
						status: NotificationType.SUCCESS
					});
					setLoading(false);
				},
				onFailed: (error) => {
					toast({
						title: error,
						status: NotificationType.ERROR
					});
					setLoading(false);
				}
			});
		} catch (error) {
			console.error('Transaction error:', error);
			toast({
				title: 'Transaction failed',
				status: NotificationType.ERROR
			});
			setLoading(false);
		}
	}, [apiService, user?.defaultAddress, selectedTrackIds, delegate.address, balance, conviction, setDelegateUserTracks, setDelegates, setOpen, toast]);

	useEffect(() => {
		if (user?.defaultAddress) getBalance(user.defaultAddress);
	}, [user, getBalance]);

	useEffect(() => {
		calculateTxFee();
	}, [calculateTxFee]);

	useEffect(() => {
		const availableTracks = tracks.filter((track) => {
			const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
			return !delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
		});

		setIsAllTracksSelected(selectedTracks.length > 0 && selectedTracks.length === availableTracks.length);
	}, [selectedTracks, tracks, network, delegateUserTracks]);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='max-w-2xl p-6'>
				<DialogHeader>
					<DialogTitle>
						<div className='flex items-center gap-2 text-btn_secondary_text'>
							<IoPersonAdd />
							<span>{t('delegate')}</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-4'>
					<Label>Your Address</Label>
					<AddressInput
						disabled
						className='bg-network_dropdown_bg'
						placeholder={user?.defaultAddress}
					/>

					<Label>Delegate To</Label>
					<AddressInput value={delegate.address} />
					{delegate.address && !isValidDelegate && (
						<p className='mt-1 text-sm text-amber-500'>
							Note: This address is not registered as a delegate. You can still delegate to it, but it won&apos;t appear in the delegates list.
						</p>
					)}
					<BalanceInput
						showBalance
						label='Balance'
						defaultValue={new BN(balance || '0')}
						onChange={handleBalanceChange}
					/>
					{isBalanceError && <p className='text-sm text-red-500'>You don&apos;t have enough balance to delegate</p>}
					<div className='w-full'>
						<p className='mb-3 text-sm text-wallet_btn_text'>Conviction</p>
						<ConvictionSelector onConvictionChange={setConviction} />
					</div>
					<div className='flex flex-col gap-2 rounded-lg bg-page_background p-4'>
						<div className='flex items-center justify-between gap-2'>
							<p className='text-sm text-wallet_btn_text'>Lock Period</p>
							<p className='text-sm text-wallet_btn_text'>
								{conviction}x voting balance for duration ({LOCK_PERIODS[conviction]})
							</p>
						</div>
						{balance && (
							<div className='flex items-center justify-between gap-2'>
								<p className='text-sm text-wallet_btn_text'>Votes</p>
								<p className='text-sm text-wallet_btn_text'>
									{balance ? formatBnBalance(new BN(balance).muln(conviction + 1).toString(), { withUnit: true, numberAfterComma: 2 }, network) : <Skeleton className='h-4' />}
								</p>
							</div>
						)}
					</div>

					<div className='flex flex-col gap-4'>
						<Tooltip>
							<div className='flex items-center justify-between gap-2 px-2'>
								<p className='text-sm text-wallet_btn_text'>Selected track(s)</p>
								<div className='flex cursor-pointer items-center gap-2'>
									<Checkbox
										checked={isAllTracksSelected}
										onCheckedChange={toggleAllTracks}
									/>
									<TooltipTrigger asChild>
										<span className='text-sm text-wallet_btn_text'>Delegate to all available tracks</span>
									</TooltipTrigger>
								</div>
							</div>

							<TooltipContent
								side='top'
								align='center'
								sideOffset={10}
								className='max-h-[200px] overflow-auto rounded-lg border border-border_grey bg-bg_modal p-4'
							>
								<div className='flex flex-col gap-2'>
									{tracks.map((track) => {
										const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
										const isTrackDelegated = delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);

										return (
											<div
												key={track}
												className='flex items-center gap-2 py-1'
											>
												<Checkbox
													checked={isTrackDelegated || selectedTracks.includes(track)}
													onCheckedChange={() => toggleTrack(track)}
													disabled={isTrackDelegated}
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
									className='flex items-center gap-1 rounded-full bg-grey_bg px-3 py-1 text-xs'
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
							<p>An approximate fees of {formatBnBalance(txFee, { withUnit: true, numberAfterComma: 4 }, network)} will be applied to the transaction</p>
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
						Cancel
					</Button>
					<Button
						className='btn-delegate'
						disabled={loading || !isBalanceValid || !selectedTrackIds?.length}
						onClick={handleSubmit}
					>
						{loading ? <Loader className='animate-spin' /> : 'Delegate'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DelegateDialog;
