// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { inputToBn } from '@/app/_client-utils/inputToBn';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { bnToInput } from '@/app/_client-utils/bnToInput';
import { cn } from '@/lib/utils';
import { useAssethubApiService } from '@/hooks/useAssethubApiService';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { EAssets, ENetwork } from '@/_shared/types';
import { Input } from '../Input';
import classes from './BalanceInput.module.scss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../DropdownMenu';

function BalanceInput({
	label,
	placeholder,
	onChange,
	name,
	disabled,
	defaultValue,
	value,
	multiAsset,
	className,
	showTreasuryBalance,
	showUserBalance = false,
	defaultAssetId
}: {
	label?: string;
	placeholder?: string;
	onChange?: ({ value, assetId }: { value: BN; assetId: string | null }) => void;
	name?: string;
	disabled?: boolean;
	defaultValue?: BN;
	value?: BN;
	defaultAssetId?: string | null;
	multiAsset?: boolean;
	className?: string;
	showTreasuryBalance?: boolean;
	showUserBalance?: boolean;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const [error, setError] = useState('');
	const { userPreferences } = useUserPreferences();

	const { apiService } = usePolkadotApiService();
	const { assethubApiService } = useAssethubApiService();

	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const networkDetails = NETWORKS_DETAILS[`${network}`];
	const { supportedAssets } = networkDetails;

	const [assetId, setAssetId] = useState<string | null>(null);

	const [userBalance, setUserBalance] = useState<string | null>(null);

	const [treasuryBalance, setTreasuryBalance] = useState<{ [key: string]: BN } | null>(null);
	const [nativeTreasuryBalance, setNativeTreasuryBalance] = useState<BN | null>(null);

	const assetOptions: { label: string; value: string | null }[] = Object.values(supportedAssets).map((asset) => ({
		label: asset.symbol,
		value: asset.index
	}));

	// Reorder to put USDC first if it exists
	const reorderedAssetOptions = assetOptions.sort((a, b) => {
		if (a.label === EAssets.USDC) return -1;
		if (b.label === EAssets.USDC) return 1;
		return 0;
	});

	// disable native token in multi asset for assethub kusama
	if (![ENetwork.KUSAMA].includes(network)) {
		reorderedAssetOptions.push({ label: networkDetails.tokenSymbol, value: null });
	}

	const [valueString, setValueString] = useState('');

	const onBalanceChange = (v: string | null, id?: string | null): void => {
		const { bnValue, isValid } = inputToBn(v || '', network, false, id);

		if (isValid && ValidatorService.isValidNumber(v)) {
			setError('');
			onChange?.({ value: bnValue, assetId: id || null });
		} else {
			setError('Invalid Amount');
			onChange?.({ value: BN_ZERO, assetId: id || null });
		}
	};

	useEffect(() => {
		const initialAssetId =
			defaultAssetId === undefined && multiAsset
				? Object.values(supportedAssets).find((asset) => asset.symbol === EAssets.USDC)?.index ||
					Object.values(supportedAssets).find((asset) => asset.symbol === EAssets.USDT)?.index
				: defaultAssetId;
		setAssetId(initialAssetId || null);

		if (!defaultValue || defaultValue.isZero()) {
			if (value) {
				setValueString(bnToInput(value, network, initialAssetId));
			}
			return;
		}

		setValueString(bnToInput(defaultValue, network, initialAssetId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, value]);

	useEffect(() => {
		const getBalance = async () => {
			if (!showUserBalance || !apiService || !userPreferences?.selectedAccount?.address) return;

			const { totalBalance } = await apiService.getUserBalances({ address: userPreferences.selectedAccount.address });
			setUserBalance(totalBalance.toString());
		};
		getBalance();
	}, [apiService, userPreferences?.selectedAccount?.address, showUserBalance]);

	useEffect(() => {
		const fetchTreasuryBalance = async () => {
			if (!showTreasuryBalance || !assethubApiService || !multiAsset) return;
			const balances = [ENetwork.KUSAMA, ENetwork.POLKADOT].includes(network)
				? await apiService?.getAssethubTreasuryAssetsBalance()
				: await assethubApiService?.getAssethubTreasuryAssetsBalance();
			setTreasuryBalance(balances || null);
		};
		fetchTreasuryBalance();
	}, [assethubApiService, showTreasuryBalance, multiAsset, apiService, network]);

	useEffect(() => {
		const fetchNativeTreasuryBalance = async () => {
			if (!showTreasuryBalance || !apiService || multiAsset) return;
			const balance = await apiService?.getNativeTreasuryBalance();
			setNativeTreasuryBalance(balance);
		};
		fetchNativeTreasuryBalance();
	}, [showTreasuryBalance, multiAsset, apiService]);

	return (
		<div className='min-w-[200px]'>
			<div className='mb-1 flex justify-between'>
				{label && <p className={classes.label}>{label}</p>}
				{showUserBalance && userBalance && (
					<p className='text-xs text-text_primary'>
						{t('BalanceInput.balance')}: <span className='text-text_pink'>{`${formatBnBalance(userBalance, { withUnit: true, numberAfterComma: 2 }, network)}`}</span>
					</p>
				)}
			</div>
			<div className='relative'>
				<Input
					className={cn('w-full', className)}
					placeholder={placeholder || t('BalanceInput.enterAmount')}
					onChange={(e) => {
						onBalanceChange(e.target.value, assetId);
						setValueString(e.target.value);
					}}
					name={name || 'balance'}
					id={name || 'balance'}
					value={valueString}
					disabled={disabled}
				/>
				{assetOptions.length === 0 || !multiAsset ? (
					<div className={classes.tokenSymbol}>{NETWORKS_DETAILS[`${network}`].tokenSymbol}</div>
				) : (
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger
								disabled={disabled}
								className='absolute right-4 top-1/2 flex w-auto -translate-y-1/2 items-center justify-center gap-x-2 rounded-md border-none bg-bg_pink px-2 py-1 text-xs font-medium text-white sm:px-2 sm:py-1'
							>
								{assetId ? networkDetails.supportedAssets[`${assetId}`].symbol : networkDetails.tokenSymbol}
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{reorderedAssetOptions.map((option) => (
									<DropdownMenuItem
										key={option.value}
										onClick={() => {
											setAssetId(option.value);
											onBalanceChange(valueString, option.value);
										}}
									>
										{option.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
				{showTreasuryBalance ? (
					multiAsset && treasuryBalance ? (
						<div className='absolute right-0 my-1 flex items-center gap-x-1 text-xs text-wallet_btn_text'>
							<p>{t('BalanceInput.treasuryBalance')}:</p>
							<p className='flex items-center gap-x-1 text-text_pink'>
								{formatter.format(
									Number(
										formatBnBalance(
											assetId ? treasuryBalance[`${assetId}`].toString() : treasuryBalance[`${networkDetails.tokenSymbol}`].toString(),
											{ withThousandDelimitor: false },
											network,
											assetId
										)
									)
								)}
								<span>{assetId ? networkDetails.supportedAssets[`${assetId}`].symbol : networkDetails.tokenSymbol}</span>
							</p>
						</div>
					) : nativeTreasuryBalance && !nativeTreasuryBalance.isZero() ? (
						<div className='absolute right-0 my-1 flex items-center gap-x-1 text-xs text-wallet_btn_text'>
							<p>{t('BalanceInput.treasuryBalance')}:</p>
							<p className='flex items-center gap-x-1 text-text_pink'>
								{formatter.format(Number(formatBnBalance(nativeTreasuryBalance?.toString() || '0', { withThousandDelimitor: false }, network)))}
								<span>{networkDetails.tokenSymbol}</span>
							</p>
						</div>
					) : null
				) : null}
				{error && !disabled && <p className='absolute left-0 my-1 text-sm text-failure'>{error}</p>}
			</div>
		</div>
	);
}

export default BalanceInput;
