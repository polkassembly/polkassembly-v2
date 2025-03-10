// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useMemo } from 'react';
import { IParamDef } from '@/_shared/types';

import { CID, digest, varint } from 'multiformats';

import { isCodec, u8aToHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import InputText from './InputText';
// eslint-disable-next-line import/no-cycle
import StructComp from './Struct';

export interface ExpandedCid {
	codec: number;
	hash: {
		code: number;
		digest: HexString;
	};
	version: 0 | 1;
}

export function fromIpfsCid(cid: string): ExpandedCid | null {
	try {
		const {
			code: codec,
			multihash: { code, digest: _digest },
			version
		} = CID.parse(cid);

		return {
			codec,
			hash: {
				code,
				digest: u8aToHex(_digest)
			},
			version
		};
	} catch (error) {
		console.error(`fromIpfsCid: ${(error as Error).message}::`, cid);

		return null;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toIpfsCid(cid: any): string | null {
	try {
		const {
			codec,
			hash_: { code, digest: _bytes },
			version
		} = cid;

		// Since we use parse, encode into a fully-specified bytes to
		// pass - <varint code> + <varint length> + bytes
		const bytes = _bytes.toU8a(true);
		const codeLen = varint.encodingLength(code.toNumber());
		const sizeLen = varint.encodingLength(bytes.length);
		const encoded = new Uint8Array(codeLen + sizeLen + bytes.length);

		varint.encodeTo(code.toNumber(), encoded, 0);
		varint.encodeTo(bytes.length, encoded, codeLen);
		encoded.set(bytes, codeLen + sizeLen);

		return CID.create(version.index as 0, codec.toNumber(), digest.decode(encoded)).toString();
	} catch (error) {
		console.error(`toIpfsCid: ${(error as Error).message}::`, cid.toHuman());

		return null;
	}
}

function Cid({ param, onChange, defaultValue }: { param: IParamDef; onChange: (value?: ExpandedCid) => void; defaultValue: string }) {
	const ipfsCid = useMemo(() => (defaultValue && isCodec(defaultValue) ? toIpfsCid(defaultValue) : null), [defaultValue]);

	const isStruct = useMemo(() => !defaultValue || isCodec(defaultValue), [defaultValue]);

	const onParamChange = (v: unknown): void => {
		const value = fromIpfsCid(v as string);

		onChange(value ?? undefined);
	};

	if (ipfsCid) {
		return (
			<InputText
				onChange={onParamChange}
				defaultValue={ipfsCid}
				param={param}
			/>
		);
	}

	if (isStruct) {
		return (
			<StructComp
				onChange={onParamChange}
				param={param}
			/>
		);
	}

	return (
		<InputText
			onChange={onParamChange}
			param={param}
		/>
	);
}

export default Cid;
