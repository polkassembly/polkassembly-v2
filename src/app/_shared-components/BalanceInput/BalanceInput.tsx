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
import { ChevronDown } from 'lucide-react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUser } from '@/hooks/useUser';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Input } from '../Input';
import classes from './BalanceInput.module.scss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../DropdownMenu';
import { Skeleton } from '../Skeleton';

function BalanceInput({
	label,
	placeholder,
	onChange,
	name,
	disabled,
	defaultValue,
	multiAsset,
	showBalance = false
}: {
	label: string;
	placeholder?: string;
	onChange?: ({ value, assetId }: { value: BN; assetId: string | null }) => void;
	name?: string;
	disabled?: boolean;
	defaultValue?: BN;
	multiAsset?: boolean;
	showBalance?: boolean;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { user } = useUser();
	const [error, setError] = useState('');
	const { apiService } = usePolkadotApiService();
	const [balance, setBalance] = useState<string | null>(null);

	const networkDetails = NETWORKS_DETAILS[`${network}`];
	const { supportedAssets } = networkDetails;

	const [assetId, setAssetId] = useState<string | null>(null);

	const assetOptions = Object.values(supportedAssets).map((asset) => ({
		label: asset.symbol,
		value: asset.index
	}));

	const [valueString, setValueString] = useState('');

	const getBalance = async (address: string) => {
		if (!apiService) return;

		const { totalBalance } = await apiService.getUserBalances({ address });
		setBalance(totalBalance.toString());
	};

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
		if (user?.defaultAddress) getBalance(user.defaultAddress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return (
		<div className='min-w-[200px]'>
			{showBalance ? (
				<div className='flex justify-between'>
					<p className={classes.label}>{label}</p>
					<p className='text-xs text-text_primary'>
						Balance:{' '}
						<span className='text-text_pink'>{balance ? `${formatBnBalance(balance, { withUnit: true, numberAfterComma: 2 }, network)}` : <Skeleton className='h-4' />}</span>
					</p>
				</div>
			) : (
				<p className={classes.label}>{label}</p>
			)}

			<div className='relative'>
				<Input
					className='w-full'
					placeholder={placeholder || t('BalanceInput.addBalance')}
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
					<div className={classes.tokenSymbol}>
						<DropdownMenu>
							<DropdownMenuTrigger
								disabled={disabled}
								className='flex w-full items-center gap-x-2'
							>
								{assetId ? networkDetails.supportedAssets[`${assetId}`].symbol : networkDetails.tokenSymbol}
								<ChevronDown className='text-xs text-white' />
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
				{error && !disabled && <p className='absolute left-0 my-1 text-sm text-failure'>{error}</p>}
			</div>
		</div>
	);
}

export default BalanceInput;
