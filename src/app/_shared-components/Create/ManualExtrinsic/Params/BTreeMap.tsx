// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BTreeMap } from '@polkadot/types';
import { Registry } from '@polkadot/types/types';
import { getInitValue } from '@/app/_client-utils/initValue';
import { Button } from '@/app/_shared-components/Button';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
// eslint-disable-next-line import/no-cycle
import Params from '.';

function getParamType([key, value]: IParamDef[]): IParamDef[] {
	return [
		{
			name: '(Key, Value)',
			type: {
				info: 17,
				sub: [key.type, value.type],
				type: `(${key.type.type}, ${value.type.type})`
			}
		}
	];
}

function getParam([{ name, type }]: IParamDef[], index: number): IParamDef {
	return {
		name: `${index}: ${name || type.type}`,
		type
	};
}

export function getParams(inputParams: IParamDef[], prev: IParamDef[], max: number): IParamDef[] {
	if (prev.length === max) {
		return prev;
	}

	const params: IParamDef[] = [];

	for (let index = 0; index < max; index += 1) {
		params.push(getParam(inputParams, index));
	}

	return params;
}

export function getValues(value: unknown): unknown[] {
	return value instanceof BTreeMap
		? [...value.entries()].map(([key, v]: unknown[]) => {
				return [key, v];
			})
		: [];
}

function BTreeMapComp({
	param,
	onChange,
	defaultValue,
	registry
}: {
	param: IParamDef;
	onChange: (value: Map<unknown, unknown>) => void;
	defaultValue?: unknown;
	registry: Registry;
}) {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const keyValueParam = getParamType(
		useMemo(() => {
			return apiService?.getPreimageParamsFromTypeDef({ type: param.type }) || [];
		}, [apiService, param.type])
	);

	const [values, setValues] = useState<unknown[]>(() => getValues(defaultValue));
	const [count, setCount] = useState(() => values.length);
	const [params, setParams] = useState<IParamDef[]>(() => getParams(keyValueParam, [], count));

	useEffect((): void => {
		if (keyValueParam.length) {
			setParams((prev) => getParams(keyValueParam, prev, count));
		}
	}, [count, keyValueParam]);

	useEffect((): void => {
		if (!keyValueParam.length) return;

		setValues((prevValue): unknown[] => {
			if (prevValue.length === count) {
				return prevValue;
			}

			while (prevValue.length < count) {
				const value = getInitValue(registry, keyValueParam[0].type);

				prevValue.push(value);
			}

			return prevValue.slice(0, count);
		});
	}, [count, defaultValue, keyValueParam, registry]);

	useEffect((): void => {
		const output = new Map();

		values.forEach((entry) => {
			const [key, value] = entry as unknown[];

			if (output.has(key)) {
				console.error('BTreeMap: Duplicate key ', key);
			}

			output.set(key, value);
		});

		onChange(output);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values]);

	const addRow = useCallback((): void => setCount((prevCount) => prevCount + 1), []);
	const removeRow = useCallback((): void => setCount((prevCount) => prevCount - 1), []);

	return (
		<div className='flex flex-col gap-y-1'>
			<div className='flex items-center justify-end gap-x-2 text-text_pink'>
				<Button
					onClick={addRow}
					variant='ghost'
					size='sm'
					leftIcon={<Plus />}
				>
					{t('CreatePreimage.addItem')}
				</Button>
				<Button
					onClick={removeRow}
					variant='ghost'
					size='sm'
					leftIcon={<Minus />}
					disabled={values.length === 0}
				>
					{t('CreatePreimage.removeItem')}
				</Button>
			</div>
			<Params
				params={params}
				onChange={setValues}
				values={values}
			/>
		</div>
	);
}

export default BTreeMapComp;
