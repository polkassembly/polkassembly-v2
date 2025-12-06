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
	registry?: Registry;
};

export type BitLength = 8 | 16 | 32 | 64 | 128 | 256;

function getBitLength({ registry, type }: { registry?: Registry; type: IParamDef }): BitLength {
	// PAPI: Try to infer bit length from the type string directly
	// PAPI types usually come as 'u8', 'u16', 'u32', 'u64', 'u128', 'u256', etc.
	const typeName = type.type.type as string;
	if (typeName) {
		const match = typeName.match(/^[ui](\d+)$/);
		if (match) {
			const bits = parseInt(match[1], 10);
			if ([8, 16, 32, 64, 128, 256].includes(bits)) {
				return bits as BitLength;
			}
		}
	}

	// Fallback to registry for PolkadotJS
	if (registry) {
		try {
			return registry.createType(type.type.type as unknown as 'u32').bitLength() as BitLength;
		} catch {
			return 32;
		}
	}

	return 32;
}

function Amount({ onChange, ...props }: AmountProps) {
	const bitLength = useMemo(() => getBitLength({ registry: props.registry, type: props.param }), [props.registry, props.param]);

	return (
		<InputNumber
			onChange={onChange}
			{...props}
			bitLength={bitLength}
		/>
	);
}

export default Amount;
