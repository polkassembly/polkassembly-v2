// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_ZERO } from '@polkadot/util';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { Separator } from '@/app/_shared-components/Separator';
import TxFeesDetailsView from '@/app/_shared-components/Create/TxFeesDetailsView/TxFeesDetailsView';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import BalanceInput from '../BalanceInput/BalanceInput';
import AddressInput from '../AddressInput/AddressInput';
import Balance from '../Balance';

function TeleportToPeopleChain({ onSuccess }: { onSuccess?: () => void }) {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const { setVaultQrState } = usePolkadotVault();
	const [totalAmount, setTotalAmount] = useState<BN>(BN_ZERO);
	const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>(userPreferences.selectedAccount?.address || '');

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const tx = useMemo(
		() => apiService && beneficiaryAddress && totalAmount.gt(BN_ZERO) && apiService.getTeleportToPeopleChainTx({ beneficiaryAddress, amount: totalAmount }),
		[apiService, beneficiaryAddress, totalAmount]
	);

	const teleportFundsToPeopleChain = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !tx || !beneficiaryAddress || totalAmount.isZero() || !userPreferences.wallet) {
			return;
		}

		setLoading(true);

		await apiService.teleportToPeopleChain({
			address: userPreferences.selectedAccount.address,
			wallet: userPreferences.wallet,
			setVaultQrState,
			beneficiaryAddress,
			amount: totalAmount,
			onSuccess: () => {
				toast({
					title: t('TeleportToPeopleChain.teleportFundsToPeopleChainSuccess'),
					description: t('TeleportToPeopleChain.teleportFundsToPeopleChainSuccessDescription'),
					status: ENotificationStatus.SUCCESS
				});
				setLoading(false);
				onSuccess?.();
			},
			onFailed: () => {
				toast({
					title: t('TeleportToPeopleChain.teleportFundsToPeopleChainFailed'),
					description: t('TeleportToPeopleChain.teleportFundsToPeopleChainFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-3 overflow-y-auto sm:gap-y-4'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>

				<div className='flex flex-col gap-y-1'>
					<div className='flex items-center justify-between'>
						<p className='text-sm text-wallet_btn_text'>{t('TeleportToPeopleChain.BeneficiaryAddress')}</p>
						<Balance
							address={beneficiaryAddress}
							showPeopleChainBalance
						/>
					</div>
					<AddressInput
						value={beneficiaryAddress}
						onChange={setBeneficiaryAddress}
					/>
				</div>

				<BalanceInput
					label={t('TeleportToPeopleChain.Amount')}
					onChange={({ value }) => setTotalAmount(value)}
				/>
			</div>

			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			{tx && <TxFeesDetailsView extrinsicFn={[tx] as any} />}

			<Separator />

			<div className='flex justify-end'>
				<Button
					onClick={teleportFundsToPeopleChain}
					isLoading={loading}
					disabled={totalAmount.isZero() || !userPreferences.selectedAccount?.address || !tx || !beneficiaryAddress}
				>
					{t('TeleportToPeopleChain.teleport')}
				</Button>
			</div>
		</div>
	);
}

export default TeleportToPeopleChain;
