// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputHTMLAttributes, useMemo } from 'react';
import { IParamDef } from '@/_shared/types';
import { Registry } from '@polkadot/types/types';
import InputNumber from './InputNumber';

type AmountProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (value: number) => void;
	param: IParamDef;
	registry: Registry;
};

export type BitLength = 8 | 16 | 32 | 64 | 128 | 256;

function getBitLength(registry: Registry, { type }: IParamDef): BitLength {
	try {
		return registry.createType(type as unknown as 'u32').bitLength() as BitLength;
	} catch {
		return 32;
	}
}

function Amount({ onChange, ...props }: AmountProps) {
	const bitLength = useMemo(() => getBitLength(props.registry, props.param), [props.registry, props.param]);

	return (
		<InputNumber
			onChange={onChange}
			{...props}
			bitLength={bitLength}
		/>
	);
}

export default Amount;
