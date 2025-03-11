// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { assert, isHex, u8aToString } from '@polkadot/util';
import InputFile from './InputFile';
import { createParam } from './KeyValue';

function parseFile(raw: Uint8Array): [Uint8Array, Uint8Array][] {
	const json = JSON.parse(u8aToString(raw)) as Record<string, string>;
	const keys = Object.keys(json);
	return keys.map((key): [Uint8Array, Uint8Array] => {
		const value = json[`${key}`];

		assert(isHex(key) && isHex(value), `Non-hex key/value pair found in ${key.toString()} => ${value.toString()}`);

		const encKey = createParam(key);
		const encValue = createParam(value);

		return [encKey, encValue];
	});
}

function KeyValueArray({ onChange }: { onChange: (value: [Uint8Array, Uint8Array][]) => void }) {
	const onParamChange = (raw: Uint8Array): void => {
		let encoded: [Uint8Array, Uint8Array][] = [];

		try {
			encoded = parseFile(raw);
		} catch (error) {
			console.error('Error converting json k/v', error);
		}

		onChange(encoded);
	};

	return <InputFile onChange={onParamChange} />;
}

export default KeyValueArray;
