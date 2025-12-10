// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus, EProxyType } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { Separator } from '@/app/_shared-components/Separator';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { Label } from '@/app/_shared-components/Label';
import { Input } from '@/app/_shared-components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Loader } from 'lucide-react';

// Proxy types available on Polkadot
const PROXY_TYPES: EProxyType[] = [
	EProxyType.ANY,
	EProxyType.NON_TRANSFER,
	EProxyType.GOVERNANCE,
	EProxyType.STAKING,
	EProxyType.IDENTITY_JUDGEMENT,
	EProxyType.CANCEL_PROXY,
	EProxyType.AUCTION,
	EProxyType.NOMINATION_POOLS
];

// Get translation key for proxy type
const getProxyTypeTranslationKey = (proxyTypeValue: EProxyType): string => {
	switch (proxyTypeValue) {
		case EProxyType.ANY:
			return 'any';
		case EProxyType.NON_TRANSFER:
			return 'non_transfer';
		case EProxyType.GOVERNANCE:
			return 'governance';
		case EProxyType.STAKING:
			return 'staking';
		case EProxyType.IDENTITY_JUDGEMENT:
			return 'identity_judgement';
		case EProxyType.AUCTION:
			return 'auction';
		case EProxyType.CANCEL_PROXY:
			return 'cancel_proxy';
		case EProxyType.PARAREGISTRATION:
			return 'pararegistration';
		case EProxyType.NOMINATION_POOLS:
			return 'nomination_pools';
		case EProxyType.SUDO_BALANCES:
			return 'sudo_balances';
		default:
			return 'any';
	}
};

function CreateProxy({ onSuccess }: { onSuccess?: () => void }) {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();

	const { setVaultQrState } = usePolkadotVault();

	const [delegateAddress, setDelegateAddress] = useState<string>('');
	const [proxyType, setProxyType] = useState<EProxyType>(EProxyType.GOVERNANCE);
	const [delay, setDelay] = useState<number>(0);

	const [loading, setLoading] = useState(false);
	const [txFee, setTxFee] = useState<BN>(BN_ZERO);
	const [depositBase, setDepositBase] = useState<BN>(BN_ZERO);
	const [depositFactor, setDepositFactor] = useState<BN>(BN_ZERO);

	const { toast } = useToast();

	// Check if delegate address is valid
	const isValidDelegateAddress = useMemo(() => {
		if (!delegateAddress) return false;
		return !!getSubstrateAddress(delegateAddress);
	}, [delegateAddress]);

	// Fetch deposit constants and estimate fees
	useEffect(() => {
		const fetchFees = async () => {
			if (!apiService || !userPreferences.selectedAccount?.address || !isValidDelegateAddress) {
				setTxFee(BN_ZERO);
				return;
			}

			try {
				const [base, factor, fee] = await Promise.all([
					apiService.getProxyDepositBase(),
					apiService.getProxyDepositFactor(),
					apiService.estimateProxyTxFee({
						address: userPreferences.selectedAccount.address,
						delegate: delegateAddress,
						proxyType,
						delay
					})
				]);

				setDepositBase(base);
				setDepositFactor(factor);
				setTxFee(fee);
			} catch {
				// Silently fail - fee estimation is not critical
			}
		};

		fetchFees();
	}, [apiService, userPreferences.selectedAccount?.address, delegateAddress, proxyType, delay, isValidDelegateAddress]);

	const totalDeposit = useMemo(() => {
		// Deposit = depositBase + depositFactor * number_of_proxies
		// For first proxy, it's depositBase + depositFactor
		return depositBase.add(depositFactor);
	}, [depositBase, depositFactor]);

	const handleCreateProxy = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !userPreferences.wallet || !isValidDelegateAddress) {
			toast({
				title: t('Proxies.proxyCreationFailed'),
				description: t('Proxies.invalidDelegateAddress'),
				status: ENotificationStatus.ERROR
			});
			return;
		}

		setLoading(true);

		await apiService.addProxy({
			address: userPreferences.selectedAccount.address,
			wallet: userPreferences.wallet,
			setVaultQrState,
			delegate: delegateAddress,
			proxyType,
			delay,
			selectedAccount: userPreferences.selectedAccount,
			onSuccess: () => {
				toast({
					title: t('Proxies.proxyCreatedSuccessfully'),
					status: ENotificationStatus.SUCCESS
				});
				setLoading(false);
				onSuccess?.();
			},
			onFailed: (error) => {
				toast({
					title: t('Proxies.proxyCreationFailed'),
					description: error,
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
				{/* Wallet/Address Selector */}
				<SwitchWalletOrAddress
					small
					customAddressSelector={
						<AddressRelationsPicker
							withBalance
							showTransferableBalance
						/>
					}
				/>

				{/* Delegate Address Input */}
				<div className='flex flex-col gap-y-2'>
					<Label className='text-sm font-medium text-text_primary'>{t('Proxies.delegateAddress')}</Label>
					<AddressInput
						placeholder={t('Proxies.delegateAddressPlaceholder')}
						onChange={setDelegateAddress}
						value={delegateAddress}
					/>
				</div>

				{/* Proxy Type Selector */}
				<div className='flex flex-col gap-y-2'>
					<Label className='text-sm font-medium text-text_primary'>{t('Proxies.proxyType')}</Label>
					<Select
						value={proxyType}
						onValueChange={(value) => setProxyType(value as EProxyType)}
					>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder={t('Proxies.selectProxyType')} />
						</SelectTrigger>
						<SelectContent>
							{PROXY_TYPES.map((type) => (
								<SelectItem
									key={type}
									value={type}
								>
									{t(`ProxyType.${getProxyTypeTranslationKey(type)}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Delay Input */}
				<div className='flex flex-col gap-y-2'>
					<Label className='text-sm font-medium text-text_primary'>{t('Proxies.delayBlocks')}</Label>
					<div className='flex items-center gap-x-2'>
						<Input
							type='number'
							min={0}
							value={delay}
							onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value, 10) || 0))}
							className='w-full'
						/>
						<span className='text-sm text-wallet_btn_text'>{t('Proxies.blocks')}</span>
					</div>
					<p className='text-xs text-wallet_btn_text'>{t('Proxies.delayBlocksDescription')}</p>
				</div>

				<Separator />

				{/* Fee Details */}
				{isValidDelegateAddress && (
					<div className='flex flex-col gap-y-2 rounded-lg bg-create_option_bg p-4'>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-wallet_btn_text'>Deposit Required</span>
							<span className='text-sm font-medium text-text_primary'>
								{formatBnBalance(totalDeposit, { withUnit: true, numberAfterComma: 4 }, network)} {NETWORKS_DETAILS[`${network}`]?.tokenSymbol}
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-wallet_btn_text'>{t('TxFees.gasFees')}</span>
							<span className='text-sm font-medium text-text_primary'>
								{formatBnBalance(txFee, { withUnit: true, numberAfterComma: 4 }, network)} {NETWORKS_DETAILS[`${network}`]?.tokenSymbol}
							</span>
						</div>
					</div>
				)}
			</div>

			<Separator />

			{/* Submit Button */}
			<div className='flex justify-end'>
				<Button
					onClick={handleCreateProxy}
					disabled={!userPreferences.selectedAccount?.address || !isValidDelegateAddress || loading}
				>
					{loading ? <Loader className='h-4 w-4 animate-spin' /> : t('Proxies.createProxy')}
				</Button>
			</div>
		</div>
	);
}

export default CreateProxy;
