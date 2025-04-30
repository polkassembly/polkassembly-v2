// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@ui/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { IoPersonRemove } from '@react-icons/all-files/io5/IoPersonRemove';
import { Label } from '@/app/_shared-components/Label';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ENotificationStatus, EDelegationStatus } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Info, Loader } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Alert } from '@/app/_shared-components/Alert';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/useToast';
import { BN } from '@polkadot/util';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { useTranslations } from 'next-intl';

interface UndelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string; balance: string };
	children?: ReactNode;
	disabled?: boolean;
	trackId?: number;
	trackName?: string;
	onUndelegateSuccess?: () => void;
}

function UndelegateDialog({ open, setOpen, delegate, children, disabled, trackId, trackName, onUndelegateSuccess }: UndelegateDialogProps) {
	const { user } = useUser();
	const router = useRouter();
	const t = useTranslations('Delegation');
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<BN | null>(null);

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (disabled && isOpen) {
				return;
			}

			if (!user) {
				router.push('/login');
			} else {
				setOpen(isOpen);
			}
		},
		[user, router, setOpen, disabled]
	);

	const calculateTxFee = useCallback(async () => {
		if (!apiService || !user?.defaultAddress || !trackId) return;

		try {
			const fee = await apiService.getUndelegateTxFee({
				address: user.defaultAddress,
				trackId
			});
			setTxFee(fee);
		} catch (error) {
			console.error('Failed to calculate transaction fee:', error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, user?.defaultAddress, trackId]);

	const handleSubmit = useCallback(async () => {
		if (!apiService || !user?.defaultAddress || trackId === undefined) return;

		try {
			setLoading(true);
			await apiService.undelegate({
				address: user.defaultAddress,
				trackId,
				onSuccess: () => {
					if (delegateUserTracks) {
						setDelegateUserTracks(
							delegateUserTracks.map((track) => {
								if (track.trackId === trackId) {
									return {
										...track,
										status: EDelegationStatus.UNDELEGATED
									};
								}
								return track;
							})
						);
					}

					setOpen(false);
					toast({
						title: t('undelegatedSuccessfully'),
						status: ENotificationStatus.SUCCESS
					});
					setLoading(false);
					onUndelegateSuccess?.();
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
				title: t('transactionFailed'),
				status: ENotificationStatus.ERROR
			});
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, user?.defaultAddress, trackId, delegateUserTracks]);

	useEffect(() => {
		calculateTxFee();
	}, [calculateTxFee]);

	return disabled ? (
		<div className='pointer-events-none opacity-50'>{children}</div>
	) : (
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
					<Label>{t('yourAddress')}</Label>
					<AddressInput
						disabled
						className='bg-network_dropdown_bg'
						placeholder={user?.defaultAddress}
					/>
					<Label>{t('delegateTo')}</Label>
					<AddressInput
						disabled
						className='bg-network_dropdown_bg'
						placeholder={delegate.address}
					/>

					<BalanceInput
						label={t('balance')}
						defaultValue={new BN(delegate.balance || '0')}
						disabled
					/>

					<p className='text-sm text-text_primary'>
						{t('track')}:{' '}
						<span className='text-btn_secondary_text'>
							{trackName} #{trackId}
						</span>
					</p>
					{txFee && (
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
						className='btn-undelegate'
						disabled={loading}
						onClick={handleSubmit}
					>
						{loading ? <Loader className='animate-spin' /> : t('undelegate')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default UndelegateDialog;
