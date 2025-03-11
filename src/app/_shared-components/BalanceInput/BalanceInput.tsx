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
import { Input } from '../Input';
import classes from './BalanceInput.module.scss';

function BalanceInput({
	label,
	placeholder,
	onChange,
	name,
	disabled,
	defaultValue
}: {
	label: string;
	placeholder?: string;
	onChange?: (value: BN) => void;
	name?: string;
	disabled?: boolean;
	defaultValue?: BN;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const [error, setError] = useState('');

	const [valueString, setValueString] = useState('');

	const onBalanceChange = (value: string | null): void => {
		const { bnValue, isValid } = inputToBn(value || '', network, false);

		if (isValid) {
			setError('');
			onChange?.(bnValue);
		} else {
			setError('Invalid Amount');
			onChange?.(BN_ZERO);
		}
	};

	useEffect(() => {
		if (!defaultValue) return;

		setValueString(bnToInput(defaultValue, network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue]);

	return (
		<div className='min-w-[200px]'>
			<p className={classes.label}>{label}</p>
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
				<div className={classes.tokenSymbol}>{NETWORKS_DETAILS[`${network}`].tokenSymbol}</div>
				{error && !disabled && <p className='absolute left-0 my-1 text-sm text-failure'>{error}</p>}
			</div>
		</div>
	);
}

export default BalanceInput;
