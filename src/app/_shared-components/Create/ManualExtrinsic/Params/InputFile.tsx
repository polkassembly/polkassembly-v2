// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ChangeEvent, useCallback } from 'react';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import { Input } from '../../../Input';

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const STR_NL = '\n';

function InputFile({ onChange }: { onChange: (value: Uint8Array) => void }) {
	function convertResult(result: ArrayBuffer): Uint8Array {
		const data = new Uint8Array(result);

		// this converts the input (if detected as hex), via the hex conversion route
		if (data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
			let hex = u8aToString(data);

			while (hex.endsWith(STR_NL)) {
				hex = hex.substring(0, hex.length - 1);
			}

			if (isHex(hex)) {
				return hexToU8a(hex);
			}
		}

		return data;
	}

	const onFileChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { files } = e.target;
			if (!files) return;
			Array.from(files).forEach((file): void => {
				const reader = new FileReader();

				reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
					if (target?.result) {
						const data = convertResult(target.result as ArrayBuffer);

						onChange(data);
					}
				};

				reader.readAsArrayBuffer(file);
			});
		},
		[onChange]
	);

	return (
		<Input
			type='file'
			onChange={onFileChange}
		/>
	);
}

export default InputFile;
