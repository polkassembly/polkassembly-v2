// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@ui/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { IoPersonRemove } from 'react-icons/io5';
import { Label } from '@/app/_shared-components/Label';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { ReactNode, useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EDelegationStatus, EPostOrigin, NotificationType, IDelegateDetails } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Checkbox } from '@/app/_shared-components/checkbox';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { Info, Loader, X } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';
import { delegateUserTracksAtom, delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/useToast';
import { BN } from '@polkadot/util';

interface UndelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string };
	children?: ReactNode;
}

function UndelegateDialog({ open, setOpen, delegate, children }: UndelegateDialogProps) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const router = useRouter();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { toast } = useToast();

	const tracks = useMemo(() => Object.keys(NETWORKS_DETAILS[network].trackDetails), [network]);
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [, setDelegates] = useAtom(delegatesAtom);

	const [isAllTracksSelected, setIsAllTracksSelected] = useState(false);
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<string>('');

	const selectedTrackIds = useMemo(
		() => selectedTracks.map((track) => NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId).filter((id): id is number => id !== undefined),
		[selectedTracks, network]
	);

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!user) {
				router.push('/login');
			} else {
				setOpen(isOpen);
				if (isOpen) {
					setSelectedTracks([]);
					setIsAllTracksSelected(false);
				}
			}
		},
		[user, router, setOpen]
	);

	const toggleAllTracks = useCallback(() => {
		setSelectedTracks((prevSelected) => (prevSelected?.length === tracks?.length ? [] : [...tracks]));
		setIsAllTracksSelected((prev) => !prev);
	}, [tracks]);

	const toggleTrack = useCallback(
		(track: string) => {
			const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
			const isTrackDelegated = delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);

			// Only allow toggling delegated tracks
			if (!isTrackDelegated) {
				return;
			}

			setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]));
		},
		[network, delegateUserTracks]
	);

	const calculateTxFee = useCallback(async () => {
		if (!apiService || !user?.defaultAddress || selectedTrackIds?.length === 0) return;

		try {
			// Use getDelegateTxFee with zero balance for undelegation fee calculation
			const fee = await apiService.getDelegateTxFee({
				address: user.defaultAddress,
				tracks: selectedTrackIds,
				conviction: 0,
				balance: new BN(0)
			});
			setTxFee(fee.toString());
		} catch (error) {
			console.error('Failed to calculate transaction fee:', error);
		}
	}, [apiService, user?.defaultAddress, selectedTrackIds]);

	const handleSubmit = useCallback(async () => {
		if (!apiService || !user?.defaultAddress || selectedTrackIds?.length === 0) return;

		try {
			setLoading(true);
			await apiService.undelegate({
				address: user.defaultAddress,
				tracks: selectedTrackIds,
				onSuccess: () => {
					// Optimistically update delegateUserTracks to reflect undelegation
					setDelegateUserTracks((prev) => prev.map((track) => (selectedTrackIds.includes(track.trackId) ? { ...track, status: EDelegationStatus.UNDELEGATED } : track)));

					// Decrease receivedDelegationsCount for the delegate
					setDelegates((prev: IDelegateDetails[]) =>
						prev.map((d: IDelegateDetails) =>
							d.address === delegate.address ? { ...d, receivedDelegationsCount: Math.max(0, (d.receivedDelegationsCount || 0) - selectedTrackIds.length) } : d
						)
					);

					setOpen(false);
					toast({
						title: 'Undelegated successfully',
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
	}, [apiService, user?.defaultAddress, selectedTrackIds, setDelegateUserTracks, setDelegates, delegate.address, setOpen, toast]);

	useEffect(() => {
		calculateTxFee();
	}, [calculateTxFee]);

	useEffect(() => {
		setIsAllTracksSelected(selectedTracks?.length === tracks?.length);
	}, [selectedTracks, tracks]);

	// Auto-select delegated tracks when the dialog opens
	useEffect(() => {
		if (open) {
			// Reset selection when dialog opens
			setSelectedTracks([]);

			const delegatedTracks = tracks.filter((track) => {
				const trackId = NETWORKS_DETAILS[network].trackDetails[track as EPostOrigin]?.trackId;
				return delegateUserTracks.some((t) => t.trackId === trackId && t.status === EDelegationStatus.DELEGATED);
			});

			if (delegatedTracks?.length > 0) {
				// Automatically select already delegated tracks
				setSelectedTracks((prev) => {
					const newTracks = [...prev];
					delegatedTracks.forEach((track) => {
						if (!newTracks.includes(track)) {
							newTracks.push(track);
						}
					});
					return newTracks;
				});
			}
		}
	}, [open, tracks, network, delegateUserTracks]);

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
							<IoPersonRemove />
							<span>{t('undelegate')}</span>
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

					<div className='flex flex-col gap-4'>
						<Tooltip>
							<div className='flex items-center justify-between gap-2 px-2'>
								<p className='text-sm text-wallet_btn_text'>Selected track(s) to undelegate</p>
								<div className='flex cursor-pointer items-center gap-2'>
									<Checkbox
										checked={isAllTracksSelected}
										onCheckedChange={toggleAllTracks}
									/>
									<TooltipTrigger asChild>
										<span className='text-sm text-wallet_btn_text'>Undelegate from all tracks</span>
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
													checked={selectedTracks.includes(track)}
													onCheckedChange={() => toggleTrack(track)}
													disabled={!isTrackDelegated}
												/>
												<span className={!isTrackDelegated ? 'text-text_secondary' : ''}>
													{track} {!isTrackDelegated && '(Not delegated)'}
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
						disabled={loading || !selectedTrackIds?.length}
						onClick={handleSubmit}
					>
						{loading ? <Loader className='animate-spin' /> : 'Undelegate'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default UndelegateDialog;
