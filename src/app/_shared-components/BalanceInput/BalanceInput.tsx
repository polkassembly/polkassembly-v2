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
	multiAsset,
	className,
	showTreasuryBalance
}: {
	label?: string;
	placeholder?: string;
	onChange?: ({ value, assetId }: { value: BN; assetId: string | null }) => void;
	name?: string;
	disabled?: boolean;
	defaultValue?: BN;
	multiAsset?: boolean;
	className?: string;
	showTreasuryBalance?: boolean;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const [error, setError] = useState('');
	const { assethubApiService } = useAssethubApiService();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const networkDetails = NETWORKS_DETAILS[`${network}`];
	const { supportedAssets } = networkDetails;

	const [assetId, setAssetId] = useState<string | null>(null);
	const [treasuryBalance, setTreasuryBalance] = useState<{ [key: string]: BN } | null>(null);

	const assetOptions = Object.values(supportedAssets).map((asset) => ({
		label: asset.symbol,
		value: asset.index
	}));

	const [valueString, setValueString] = useState('');

	const onBalanceChange = (value: string | null): void => {
		const { bnValue, isValid } = inputToBn(value || '', network, false, assetId);

		if (isValid) {
			setError('');
			onChange?.({ value: bnValue, assetId });
		} else {
			setError('Invalid Amount');
			onChange?.({ value: BN_ZERO, assetId });
		}
	};

	useEffect(() => {
		if (!defaultValue) return;

		setValueString(bnToInput(defaultValue, network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue]);

	useEffect(() => {
		const fetchTreasuryBalance = async () => {
			if (!showTreasuryBalance || !assethubApiService) return;
			const balances = await assethubApiService?.getTreasuryAssetsBalance();
			setTreasuryBalance(balances);
		};
		fetchTreasuryBalance();
	}, [assethubApiService, showTreasuryBalance]);

	return (
		<div className='min-w-[200px]'>
			{label && <p className={classes.label}>{label}</p>}
			<div className='relative'>
				<Input
					className={cn('w-full', className)}
					placeholder={placeholder || t('BalanceInput.enterAmount')}
					onChange={(e) => {
						onBalanceChange(e.target.value);
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
								className='absolute right-4 top-1/2 flex w-auto -translate-y-1/2 items-center justify-center gap-x-2 rounded-md border-none bg-bg_pink px-2 py-1 text-xs font-medium text-white'
							>
								{assetId ? networkDetails.supportedAssets[`${assetId}`].symbol : networkDetails.tokenSymbol}
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{[{ label: networkDetails.tokenSymbol, value: null }, ...assetOptions].map((option) => (
									<DropdownMenuItem
										key={option.value}
										onClick={() => {
											setAssetId(option.value);
											onBalanceChange(null);
											setValueString('');
										}}
									>
										{option.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
				{showTreasuryBalance && treasuryBalance && (
					<div className='absolute right-0 my-1 flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<p>Treasury Balance:</p>
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
				)}
				{error && !disabled && <p className='absolute left-0 my-1 text-sm text-failure'>{error}</p>}
			</div>
		</div>
	);
}

export default BalanceInput;
