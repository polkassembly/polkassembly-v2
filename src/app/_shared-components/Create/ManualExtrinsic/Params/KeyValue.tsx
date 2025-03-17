// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { IParamDef } from '@/_shared/types';
import { compactAddLength, hexToU8a, u8aConcat } from '@polkadot/util';

import InputText from './InputText';

export function createParam(hex: string | string): Uint8Array {
	let u8a;

	try {
		u8a = hexToU8a(hex.toString());
	} catch {
		u8a = new Uint8Array([]);
	}

	return compactAddLength(u8a);
}

function KeyValue({ param, onChange, defaultValue }: { param: IParamDef; onChange: (value: Uint8Array) => void; defaultValue: string }) {
	const [key, setKey] = useState<Uint8Array>(() => new Uint8Array([]));
	const [value, setValue] = useState<Uint8Array>(() => new Uint8Array([]));

	useEffect((): void => {
		onChange(u8aConcat(key, value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, value]);

	const onParamKeyChange = useCallback((k: string): void => setKey(createParam(k)), []);
	const onParamValueChange = useCallback((v: string): void => setValue(createParam(v)), []);

	return (
		<div className='flex items-center gap-x-2'>
			<InputText
				onChange={onParamKeyChange}
				defaultValue={defaultValue}
				param={param}
			/>
			<InputText
				onChange={onParamValueChange}
				defaultValue={defaultValue}
				param={param}
			/>
		</div>
	);
}

export default KeyValue;
