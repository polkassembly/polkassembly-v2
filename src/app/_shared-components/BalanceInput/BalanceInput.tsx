// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { inputToBn } from '@/app/_client-utils/inputToBn';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Input } from '../Input';
import classes from './BalanceInput.module.scss';

function BalanceInput({ label, placeholder, onChange }: { label: string; placeholder?: string; onChange: (value: BN) => void }) {
	const network = getCurrentNetwork();
	const onBalanceChange = (value: string | null): void => {
		const [bnBalance, isValid] = inputToBn(`${value}`, network, false);

		if (isValid) {
			onChange(bnBalance);
		} else {
			onChange(BN_ZERO);
		}
	};
	return (
		<div>
			<p className={classes.label}>{label}</p>
			<div className='relative'>
				<Input
					className='w-full'
					placeholder={placeholder || 'Add Balance'}
					onChange={(e) => onBalanceChange(e.target.value)}
				/>
				<div className={classes.tokenSymbol}>{NETWORKS_DETAILS[`${network}`].tokenSymbol}</div>
			</div>
		</div>
	);
}

export default BalanceInput;
