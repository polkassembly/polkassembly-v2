// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import React, { useEffect, useMemo, useState } from 'react';
import { VecFixed } from '@polkadot/types';
// eslint-disable-next-line import/no-cycle
import Params from '.';

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
	if (value instanceof Set) {
		// eslint-disable-next-line no-param-reassign
		value = [...value.values()];
	}

	return Array.isArray(value) ? value.map((v: unknown) => v) : [];
}

function getInitialValues(defaultValue: unknown): unknown[] {
	return defaultValue instanceof VecFixed ? defaultValue.map((value) => value) : getValues(defaultValue);
}

function VectorFixed({ param, onChange, defaultValue }: { param: IParamDef; onChange: (value: unknown) => void; defaultValue?: unknown }) {
	const { apiService } = usePolkadotApiService();
	const inputParams = useMemo(() => {
		return apiService?.getPreimageParamsFromTypeDef({ type: param.type }) || [];
	}, [apiService, param.type]);

	const [params] = useState<IParamDef[]>(() => getParams(inputParams, [], inputParams[0].length || 1));
	const [values, setValues] = useState<unknown[]>(() => getInitialValues(defaultValue));

	useEffect((): void => {
		onChange(values.map((value) => value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values]);

	return (
		<Params
			params={params}
			onChange={setValues}
			values={values}
		/>
	);
}

export default VectorFixed;
