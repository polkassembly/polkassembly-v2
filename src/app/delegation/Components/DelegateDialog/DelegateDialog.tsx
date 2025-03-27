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
import { ReactNode, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConvictionSelector from '@/app/_shared-components/PostDetails/VoteReferendum/ConvictionSelector/ConvictionSelector';
import { EConvictionAmount } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Checkbox } from '@/app/_shared-components/checkbox';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { X } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';

interface DelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string };
	children?: ReactNode;
}

const lockPeriods = ['no lockup period', '7 days', '14 days', '28 days', '56 days', '112 days', '224 days'];

function DelegateDialog({ open, setOpen, delegate, children }: DelegateDialogProps) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const router = useRouter();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	// eslint-disable-next-line
	const [isDelegated, setIsDelegated] = useState(false);
	const [delegationInfo, setDelegationInfo] = useState<{
		target: string;
		conviction: number;
		balance: BN;
	} | null>(null);
	const [conviction, setConviction] = useState<EConvictionAmount>(EConvictionAmount.ZERO);
	const [balance, setBalance] = useState<string>('');
	const tracks = Object.keys(NETWORKS_DETAILS[network].trackDetails);
	const [isAllTracksSelected, setIsAllTracksSelected] = useState(false);
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [userBalance, setUserBalance] = useState<string | null>(null);
	const [isBalanceError, setIsBalanceError] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);

	const checkDelegationStatus = async () => {
		if (!apiService || !user?.defaultAddress || selectedTracks.length === 0) return;

		// const track = parseInt(selectedTracks[0]);
		// // const isCurrentlyDelegated = await apiService.isDelegated({
		// // address: user.defaultAddress,
		// // track
		// // });

		// setIsDelegated(isCurrentlyDelegated);

		const info = await apiService.getDelegationInfo({
			address: user.defaultAddress,
			track: 0
		});

		console.log('info', info);

		setDelegationInfo(info);
		if (info) {
			setBalance(info.balance.toString());
			setConviction(info.conviction);
		}
	};

	useEffect(() => {
		checkDelegationStatus();
	}, [user?.defaultAddress, selectedTracks, apiService]);

	const handleOpenChange = (isOpen: boolean) => {
		if (!user) {
			router.push('/login');
		} else {
			setOpen(isOpen);
			setBalance('');
			setIsBalanceError(false);
		}
	};

	const toggleAllTracks = () => {
		if (isAllTracksSelected) {
			setSelectedTracks([]);
		} else {
			setSelectedTracks(tracks);
		}
		setIsAllTracksSelected(!isAllTracksSelected);
	};

	const isBalanceValid = useMemo(() => {
		if (!balance || balance === '0') return false;
		if (!userBalance) return false;
		const enteredBalance = new BN(balance);
		const requiredBalance = enteredBalance.muln(conviction + 1);
		const isValid = enteredBalance.gt(new BN(0)) && requiredBalance.lte(new BN(userBalance));
		setIsBalanceError(!isValid);
		return isValid;
	}, [balance, userBalance, conviction]);

	const handleBalanceChange = ({ value }: { value: BN; assetId: string | null }) => {
		setBalance(value.toString());
	};

	const getBalance = async (address: string) => {
		if (!apiService) return;

		const { totalBalance } = await apiService.getUserBalances({ address });
		setUserBalance(totalBalance.toString());
	};

	const handleSubmit = async () => {
		if (!apiService || !user?.defaultAddress || selectedTracks.length === 0) return;

		setLoading(true);
		try {
			if (isDelegated) {
				await apiService.undelegate({
					address: user.defaultAddress,
					tracks: selectedTracks.map((track) => parseInt(track, 10)),
					onSuccess: () => {
						setOpen(false);
						checkDelegationStatus();
					},
					onFailed: (error) => {
						console.error('Failed to undelegate:', error);
					}
				});
			} else {
				await apiService.delegate({
					address: user.defaultAddress,
					delegateAddress: delegate.address,
					balance: new BN(balance),
					conviction,
					tracks: selectedTracks.map((track) => parseInt(track, 10)),
					onSuccess: () => {
						setOpen(false);
						checkDelegationStatus();
					},
					onFailed: (error) => {
						console.error('Failed to delegate:', error);
					}
				});
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?.defaultAddress) getBalance(user.defaultAddress);
	}, [user]);

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
							<span>{isDelegated ? t('undelegate') : t('delegate')}</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-4'>
					{isDelegated && delegationInfo && (
						<Alert variant='info'>
							Currently delegating {formatBnBalance(delegationInfo.balance.toString(), { withUnit: true }, network)} with {delegationInfo.conviction}x conviction to{' '}
							{delegationInfo.target}
						</Alert>
					)}

					<Label>Your Address</Label>
					<AddressInput
						disabled
						className='bg-network_dropdown_bg'
						placeholder={user?.defaultAddress}
					/>

					{!isDelegated && (
						<>
							<Label>Delegate To</Label>
							<AddressInput value={delegate.address} />
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
										{conviction}x voting balance for duration ({lockPeriods[conviction]})
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
						</>
					)}

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
										<span className='text-sm text-wallet_btn_text'>{isDelegated ? 'Undelegate from all tracks' : 'Delegate to all available tracks'}</span>
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
									{tracks.map((track) => (
										<div
											key={track}
											className='flex items-center gap-2 py-1'
										>
											<Checkbox
												checked={selectedTracks.includes(track)}
												onCheckedChange={() => {
													setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]));
												}}
											/>
											<span>{track}</span>
										</div>
									))}
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
										onClick={() => setSelectedTracks((prev) => prev.filter((t) => t !== track))}
									/>
								</span>
							))}
						</div>
					</div>
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
						disabled={isDelegated ? !selectedTracks.length : !isBalanceValid || !selectedTracks.length}
						onClick={handleSubmit}
					>
						{loading ? 'Processing...' : isDelegated ? 'Undelegate' : 'Delegate'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DelegateDialog;
