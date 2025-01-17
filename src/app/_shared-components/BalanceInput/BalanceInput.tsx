// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { inputToBn } from '@/app/_client-utils/inputToBn';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { Input } from '../Input';
import classes from './BalanceInput.module.scss';

function BalanceInput({ label, placeholder, onChange, name }: { label: string; placeholder?: string; onChange: (value: BN) => void; name?: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const [valueString, setValueString] = useState('');

	const onBalanceChange = (value: string | null): void => {
		const { bnValue, isValid } = inputToBn(value || '', network, false);

		if (isValid) {
			onChange(bnValue);
		} else {
			onChange(BN_ZERO);
		}
	};

	useEffect(() => {
		onBalanceChange(valueString);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
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
				/>
				<div className={classes.tokenSymbol}>{NETWORKS_DETAILS[`${network}`].tokenSymbol}</div>
			</div>
		</div>
	);
}

export default BalanceInput;
