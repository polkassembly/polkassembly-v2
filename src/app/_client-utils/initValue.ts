// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { Registry, TypeDef } from '@polkadot/types/types';

import { getTypeDef } from '@polkadot/types';
import { TypeDefInfo } from '@polkadot/types/types';
import { BN_ZERO, isBn } from '@polkadot/util';

const warnList: string[] = [];

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getInitValue({ def, registry }: { def: TypeDef; registry?: Registry }): unknown {
	if (def.info === TypeDefInfo.Vec) {
		return [getInitValue({ def: def.sub as TypeDef, registry })];
	}
	if (def.info === TypeDefInfo.Tuple) {
		return Array.isArray(def.sub) ? def.sub.map((d) => getInitValue({ def: d, registry })) : [];
	}
	if (def.info === TypeDefInfo.Struct) {
		return Array.isArray(def.sub)
			? def.sub.reduce((result: Record<string, unknown>, d): Record<string, unknown> => {
					// eslint-disable-next-line no-param-reassign
					result[d.name || 'unknown'] = getInitValue({ def: d, registry });

					return result;
				}, {})
			: {};
	}
	if (def.info === TypeDefInfo.Enum) {
		return Array.isArray(def.sub) ? { [def.sub[0].name || 'unknown']: getInitValue({ def: def.sub[0], registry }) } : {};
	}

	const type = [TypeDefInfo.Compact, TypeDefInfo.Option].includes(def.info) ? (def.sub as TypeDef).type : def.type;

	switch (type) {
		case 'AccountIndex':
		case 'Balance':
		case 'BalanceOf':
		case 'BlockNumber':
		case 'Compact':
		case 'Gas':
		case 'Index':
		case 'Nonce':
		case 'ParaId':
		case 'PropIndex':
		case 'ProposalIndex':
		case 'ReferendumIndex':
		case 'i8':
		case 'i16':
		case 'i32':
		case 'i64':
		case 'i128':
		case 'u8':
		case 'u16':
		case 'u32':
		case 'u64':
		case 'u128':
		case 'VoteIndex':
			return BN_ZERO;

		case 'bool':
			return false;

		case 'Bytes':
			return undefined;

		case 'String':
		case 'Text':
			return '';

		case 'Moment':
			return BN_ZERO;

		case 'Vote':
			return -1;

		case 'VoteThreshold':
			return 0;

		case 'BlockHash':
		case 'CodeHash':
		case 'Hash':
		case 'H256':
			return registry ? registry.createType('H256') : '0x0000000000000000000000000000000000000000000000000000000000000000';

		case 'H512':
			return registry ? registry.createType('H512') : `0x${'00'.repeat(64)}`;

		case 'H160':
			return registry ? registry.createType('H160') : `0x${'00'.repeat(20)}`;

		case 'Raw':
		case 'Keys':
			return '';

		case 'AccountId':
		case 'AccountId20':
		case 'AccountId32':
		case 'AccountIdOf':
		case 'Address':
		case 'Call':
		case 'CandidateReceipt':
		case 'Digest':
		case 'Header':
		case 'KeyValue':
		case 'LookupSource':
		case 'MisbehaviorReport':
		case 'Proposal':
		case 'RuntimeCall':
		case 'Signature':
		case 'SessionKey':
		case 'StorageKey':
		case 'ValidatorId':
			return undefined;

		case 'Extrinsic':
			return registry ? registry.createType('Raw') : '0x';

		case 'Null':
			return null;

		default: {
			let error: string | null = null;

			if (registry) {
				try {
					const instance = registry.createType(type as 'u32');
					const raw = getTypeDef(instance.toRawType());

					if (isBn(instance)) {
						return BN_ZERO;
					}
					if ([TypeDefInfo.Struct].includes(raw.info)) {
						return undefined;
					}
					if ([TypeDefInfo.Enum, TypeDefInfo.Tuple].includes(raw.info)) {
						return getInitValue({ def: raw, registry });
					}
				} catch (e) {
					error = (e as Error).message;
				}
			}

			// we only want to want once, not spam
			if (!warnList.includes(type)) {
				warnList.push(type);
				if (registry) {
					console.error(`params: initValue: ${error}`);
				}
				console.info(`params: initValue: No default value for type ${type} from ${JSON.stringify(def)}, using defaults`);
			}

			return '0x';
		}
	}
}
