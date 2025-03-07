// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable import/no-cycle */
import { ComponentType, createElement, ReactNode, useMemo } from 'react';
import { IParamDef } from '@/_shared/types';
import { Registry, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { getTypeDef } from '@polkadot/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import BalanceInput from '../../../BalanceInput/BalanceInput';
import { Extrinsic } from '../Extrinsic/Extrinsic';
import InputText from './InputText';
import AddressInput from '../../../AddressInput/AddressInput';
import Option from './Option';
import Tuple from './Tuple';
import InputNumber from './InputNumber';
import BytesInput from './Bytes';
import Account from './Account';
import Bool from './Bool';
import EnumComp from './Enum';
import Struct from './Struct';
import VectorFixed from './VectorFixed';
import NullComp from './Null';

export interface ComponentProps {
	className?: string;
	defaultValue: unknown;
	isDisabled?: boolean;
	isError?: boolean;
	isInOption?: boolean;
	isReadOnly?: boolean;
	isOptional?: boolean;
	label?: string;
	name?: string;
	onChange?: (value: unknown) => void;
	onEnter?: () => void;
	onEscape?: () => void;
	// eslint-disable-next-line no-use-before-define
	overrides?: ComponentMap;
	param: IParamDef;
	title?: ReactNode;
	withLabel?: boolean;
	withLength?: boolean;
	registry: Registry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMap = Record<string, ComponentType<any>>;

interface TypeToComponent {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	c: ComponentType<any>;
	t: string[];
}

// eslint-disable-next-line sonarjs/no-duplicate-string
const SPECIAL_TYPES = ['AccountId', 'AccountId20', 'AccountId32', 'AccountIndex', 'Address', 'Balance', 'BalanceOf', 'Vec<KeyValue>'];

// const DISPATCH_ERROR = ['DispatchError', 'SpRuntimeDispatchError'];

const componentDef: TypeToComponent[] = [
	{ c: Account, t: ['AccountId', 'Address', 'LookupSource', 'MultiAddress'] },
	{ c: InputNumber, t: ['AccountIndex', 'i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256'] },
	{ c: BalanceInput, t: ['Amount', 'Balance', 'BalanceOf'] },
	{ c: Bool, t: ['bool'] },
	{ c: BytesInput, t: ['Bytes', 'Vec<u8>'] },
	{ c: Extrinsic, t: ['Call', 'Proposal', 'RuntimeCall'] },
	{ c: InputText, t: ['PalletAllianceCid'] },
	// { c: Code, t: ['Code'] },
	// { c: DispatchError, t: DISPATCH_ERROR },
	// { c: DispatchResult, t: ['DispatchResult', 'Result<Null, SpRuntimeDispatchError>'] },
	{ c: InputText, t: ['Raw', 'RuntimeSessionKeys', 'Keys'] },
	{ c: EnumComp, t: ['Enum'] },
	{ c: InputText, t: ['Hash', 'H256'] },
	{ c: InputText, t: ['H160'] },
	{ c: InputText, t: ['H512'] },
	// { c: KeyValue, t: ['KeyValue'] },
	// { c: KeyValueArray, t: ['Vec<KeyValue>'] },
	// { c: Moment, t: ['Moment', 'MomentOf'] },
	{ c: NullComp, t: ['Null'] },
	// { c: OpaqueCall, t: ['OpaqueCall'] },
	{ c: Option, t: ['Option'] },
	{ c: InputText, t: ['String', 'Text'] },
	{ c: Struct, t: ['Struct'] },
	{ c: Tuple, t: ['Tuple'] },
	// { c: BTreeMap, t: ['BTreeMap'] },
	// { c: Vector, t: ['Vec', 'BTreeSet'] },
	{ c: VectorFixed, t: ['VecFixed'] },
	// { c: Vote, t: ['Vote'] },
	// { c: VoteThreshold, t: ['VoteThreshold'] },
	{ c: InputText, t: ['Unknown'] }
];

const components: ComponentMap = componentDef.reduce(
	(comps, { c, t }): ComponentMap => {
		t.forEach((type): void => {
			// eslint-disable-next-line no-param-reassign
			comps[`${type}`] = c;
		});

		return comps;
	},
	{} as unknown as ComponentMap
);

const warnList: string[] = [];

function getTypeFromDef({ displayName, info, lookupName, sub, type }: TypeDef) {
	if (displayName && SPECIAL_TYPES.includes(displayName)) {
		return displayName;
	}
	if (type.endsWith('RuntimeSessionKeys')) {
		return 'RuntimeSessionKeys';
	}

	const typeValue = lookupName || type;

	switch (info) {
		case TypeDefInfo.Compact:
			return (sub as TypeDef)?.type;

		case TypeDefInfo.Option:
			return 'Option';

		case TypeDefInfo.Enum:
			return 'Enum';

		case TypeDefInfo.Struct:
			return 'Struct';

		case TypeDefInfo.BTreeSet:
			return 'BTreeSet';

		case TypeDefInfo.Tuple:
			return components[type] === AddressInput ? type : 'Tuple';

		case TypeDefInfo.Vec:
			return type === 'Vec<u8>' ? 'Bytes' : ['Vec<KeyValue>'].includes(type) ? 'Vec<KeyValue>' : 'Vec';

		case TypeDefInfo.VecFixed:
			return (sub as TypeDef)?.type === 'u8' ? type : 'VecFixed';

		default:
			return typeValue;
	}
}

function getComponent({ def, registry }: { def: TypeDef; registry?: Registry }): ComponentType<ComponentProps> | null {
	// Explicit/special handling for Account20/32 types where they don't match
	// the actual chain we are connected to
	// if (['AccountId20', 'AccountId32'].includes(def.type)) {
	// const defType = `AccountId${registry.createType('AccountId').length}`;

	// if (def.type !== defType) {
	// if (def.type === 'AccountId20') {
	// return AccountId20;
	// }
	// return AccountId32;
	// }
	// }

	const findOne = (type?: string): ComponentType<ComponentProps> | null => (type ? components[`${type}`] : null);

	const type = getTypeFromDef(def);
	let Component = findOne(def.lookupName) || findOne(def.type) || findOne(type);

	if (!Component && registry) {
		try {
			const instance = registry.createType(type as 'u32');
			const raw = getTypeDef(instance.toRawType());

			Component = findOne(raw.lookupName || raw.type) || findOne(getTypeFromDef(raw));

			if (Component) {
				return Component;
			}
			// if (isBn(instance)) {
			// return BalanceInput;
			// }
		} catch (e) {
			console.error(`params: findComponent: ${(e as Error).message}`);
		}

		// we only want to want once, not spam
		if (!warnList.includes(type)) {
			warnList.push(type);
			console.info(`params: findComponent: No pre-defined component for type ${type} from ${TypeDefInfo[def.info]}: ${JSON.stringify(def)}`);
		}
	}

	return Component || (InputText as ComponentType<ComponentProps>);
}

function Param({ param, paramValue, onChange }: { param: IParamDef; paramValue?: unknown; onChange: (value: unknown) => void }) {
	const { apiService } = usePolkadotApiService();

	const title = (
		<span className='flex items-center gap-x-1 overflow-hidden whitespace-nowrap text-sm font-medium text-text_primary'>
			{param.name && `${param.name}:`} {param.type.type}
			{param.type.typeName && ` (${param.type.typeName})`}
		</span>
	);

	const registry = useMemo(() => apiService?.getApiRegistry(), [apiService]);

	const Component = getComponent({ registry, def: param.type });
	if (!Component || !registry) return null;

	const paramComponent = createElement(Component, {
		onChange: (value: unknown) => onChange(value),
		defaultValue: paramValue,
		registry,
		param
	});

	return (
		<div className='flex flex-col gap-y-1'>
			{title}
			{paramComponent}
		</div>
	);
}

export default Param;
