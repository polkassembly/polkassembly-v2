// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { IBeneficiary, IPayout } from '@/_shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import Address from '../../Profile/Address/Address';
import { Separator } from '../../Separator';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';

function ClaimPayout({ beneficiaries }: { beneficiaries: IBeneficiary[] }) {
	const t = useTranslations('PostDetails');
	const network = getCurrentNetwork();

	const { userPreferences } = useUserPreferences();

	const { apiService } = usePolkadotApiService();

	const [loading, setLoading] = useState(false);

	const [open, setOpen] = useState(false);

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const fetchPendingTreasurySpends = async () => {
		if (!apiService) return null;

		return apiService.getTreasurySpendsData();
	};

	const { data: pendingTreasurySpends } = useQuery({
		queryKey: ['pendingTreasurySpends'],
		queryFn: fetchPendingTreasurySpends,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!apiService,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	if (!pendingTreasurySpends) return null;

	const pendingTreasurySpendsByBeneficiary = pendingTreasurySpends.filter(
		(treasurySpend) =>
			treasurySpend &&
			beneficiaries.some(
				(beneficiary) =>
					getSubstrateAddress(beneficiary.address) === treasurySpend.treasurySpendData.beneficiary && treasurySpend.treasurySpendData.generalIndex === beneficiary.assetId
			)
	);

	if (pendingTreasurySpendsByBeneficiary.length === 0) return null;

	const claimPayout = async () => {
		if (!apiService || !userPreferences?.selectedAccount?.address || pendingTreasurySpendsByBeneficiary.length === 0) return;

		setLoading(true);

		await apiService.claimTreasuryPayout({
			payouts: pendingTreasurySpendsByBeneficiary,
			address: userPreferences?.selectedAccount?.address,
			onSuccess: () => {
				setLoading(false);
				toast({
					title: t('ClaimPayout.payoutClaimedSuccessfully'),
					description: t('ClaimPayout.payoutClaimedSuccessfullyDescription')
				});
				setOpen(false);
				queryClient.setQueryData(['pendingTreasurySpends'], (oldData: { treasurySpendIndex: number; treasurySpendData: IPayout }[]) => {
					if (!oldData) return oldData;
					return oldData.filter((spend) => !pendingTreasurySpendsByBeneficiary.some((claimedSpend) => claimedSpend?.treasurySpendIndex === spend.treasurySpendIndex));
				});
			},
			onFailed: () => {
				setLoading(false);
				toast({
					title: t('ClaimPayout.payoutClaimFailed'),
					description: t('ClaimPayout.payoutClaimFailedDescription')
				});
			}
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger>
				<Button
					className='w-full'
					size='lg'
				>
					{t('ClaimPayout.claimPayout')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl p-3 sm:p-6'>
				<DialogHeader>
					<DialogTitle>{t('ClaimPayout.claimPayout')}</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-y-4'>
					<SwitchWalletOrAddress
						small
						withBalance
					/>
					<div className='flex flex-col gap-y-2'>
						<div className='grid grid-cols-4 gap-x-4 rounded border border-border_grey p-2 text-sm font-medium text-text_primary'>
							<p className='col-span-1'>{t('ClaimPayout.index')}</p>
							<p className='col-span-1'>{t('ClaimPayout.beneficiary')}</p>
							<p className='col-span-1'>{t('ClaimPayout.amount')}</p>
							<p className='col-span-1'>{t('ClaimPayout.expireIn')}</p>
						</div>
						{pendingTreasurySpendsByBeneficiary.map(
							(treasurySpend) =>
								treasurySpend && (
									<div className='grid grid-cols-4 gap-x-4 rounded border border-border_grey p-3 text-sm text-text_primary'>
										<p className='col-span-1'>{treasurySpend.treasurySpendIndex}</p>
										<p className='col-span-1 truncate'>
											<Address address={treasurySpend.treasurySpendData.beneficiary} />
										</p>
										<p className='col-span-1'>
											{formatBnBalance(treasurySpend.treasurySpendData.amount, { withUnit: true, compactNotation: true }, network, treasurySpend.treasurySpendData.generalIndex)}
										</p>
										<p className='col-span-1'>{dayjs(treasurySpend.treasurySpendData.expiresAt).fromNow(true)}</p>
									</div>
								)
						)}
					</div>
				</div>
				<Separator />
				<div className='flex items-center justify-end'>
					<Button
						isLoading={loading}
						onClick={claimPayout}
						disabled={!apiService || !userPreferences?.selectedAccount?.address || pendingTreasurySpendsByBeneficiary.length === 0}
					>
						{t('ClaimPayout.claim')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ClaimPayout;
