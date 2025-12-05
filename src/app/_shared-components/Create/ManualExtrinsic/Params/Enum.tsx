// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { Enum, getTypeDef } from '@polkadot/types';
import { Registry, TypeDef } from '@polkadot/types/types';
import { useCallback, useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';
// eslint-disable-next-line import/no-cycle
import Params from '.';

interface Option {
	text?: string;
	value?: string;
}

interface Options {
	options: Option[];
	subTypes: TypeDef[];
}

interface Initial {
	initialEnum: string | undefined | null;
	initialParams: unknown[] | undefined | null;
}

function getSubTypes({ registry, type }: { registry?: Registry; type: TypeDef }): TypeDef[] {
	// PAPI: The type definition is already fully resolved in papiTypeToTypeDef,
	// so type.sub contains the array of variants directly.
	if (Array.isArray(type.sub)) {
		return type.sub;
	}
	// PolkadotJS: We need to use the registry to resolve the type definition.
	if (registry) {
		return getTypeDef(registry.createType(type.type as '(u32, u32)').toRawType()).sub as TypeDef[];
	}
	return [];
}

function getOptions({ registry, type }: { registry?: Registry; type: TypeDef }): Options {
	const subTypes = getSubTypes({ registry, type }).filter(({ name }) => !!name && !name.startsWith('__Unused'));

	return {
		options: subTypes.map(
			({ name }): Option => ({
				text: name,
				value: name
			})
		),
		subTypes
	};
}

function getInitial(options: Option[]): Initial {
	return {
		initialEnum: options[0]?.value,
		initialParams: undefined
	};
}

function getCurrent({ registry, type, defaultValue, subTypes }: { registry?: Registry; type: TypeDef; defaultValue: unknown; subTypes: TypeDef[] }): IParamDef[] | null {
	const subs = getSubTypes({ registry, type });

	return defaultValue instanceof Enum ? [{ name: defaultValue.type, type: subs[defaultValue.index] }] : [{ name: subTypes[0].name || '', type: subTypes[0] }];
}

function EnumComp({ param, onChange, defaultValue, registry }: { param: IParamDef; onChange: (value: unknown) => void; defaultValue: unknown; registry?: Registry }) {
	const { apiService } = usePolkadotApiService();
	const isPapi = apiService instanceof PolkadotApiService;

	const { options, subTypes } = useMemo(() => getOptions({ registry, type: param.type }), [registry, param.type]);

	const [current, setCurrent] = useState<IParamDef[] | null>(() => getCurrent({ registry, type: param.type, defaultValue, subTypes }));
	const [{ initialParams }, setInitial] = useState<Initial>(() => getInitial(options));

	const onEnumChange = useCallback(
		(value: string): void => {
			const newType = subTypes.find(({ name }) => name === value) || null;

			setCurrent(newType ? [{ name: newType.name || '', type: newType }] : null);

			if (newType) {
				// if the enum changes, we want to discard the original initParams,
				// these are not applicable anymore, rather use empty defaults
				setInitial((prev) => (newType.name === prev.initialEnum ? prev : { initialEnum: prev.initialEnum, initialParams: null }));
			}
		},
		[subTypes]
	);

	const onParamValueChange = useCallback(
		(values: unknown[]): void => {
			if (current) {
				const variantName = current[0].name || 'unknown';
				console.log('enum values', values);
				const innerValue = values[0];

				if (isPapi) {
					// PAPI expects: { type: 'VariantName', value: innerValue }
					onChange({ type: variantName, value: innerValue || '' });
				} else {
					// PolkadotJS expects: { VariantName: innerValue }
					onChange({ [variantName]: innerValue });
				}
			}
		},
		[current, onChange, isPapi]
	);

	return (
		<div className='flex flex-col gap-y-2'>
			<DropdownMenu>
				<DropdownMenuTrigger>{current?.[0]?.name || ''}</DropdownMenuTrigger>
				<DropdownMenuContent>
					{options.map((option) => (
						<DropdownMenuItem
							onClick={() => onEnumChange(option.value || '')}
							key={option.value}
							className='cursor-pointer'
						>
							{option.text}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{current && (
				<Params
					params={current}
					values={initialParams || []}
					onChange={onParamValueChange}
				/>
			)}
		</div>
	);
}

export default EnumComp;
