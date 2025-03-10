// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import React, { useCallback, useMemo, useState } from 'react';
import { isCodec } from '@polkadot/util';
import { Struct } from '@polkadot/types';
// eslint-disable-next-line import/no-cycle
import Params from '.';

function extractValues(value: unknown): unknown[] | undefined {
	return isCodec(value) && value instanceof Struct ? value.toArray().map((v) => v) : undefined;
}

function StructComp({ param, onChange, defaultValue }: { param: IParamDef; onChange: (value: unknown) => void; defaultValue?: unknown }) {
	const { apiService } = usePolkadotApiService();
	const [paramValues] = useState(() => extractValues(defaultValue));

	const params = useMemo(() => {
		return apiService?.getPreimageParamsFromTypeDef({ type: param.type }) || [];
	}, [apiService, param.type]);

	const onParamsChange = useCallback(
		(values: unknown[]): void => {
			onChange(
				params.reduce((value: Record<string, unknown>, { name }, index): Record<string, unknown> => {
					// eslint-disable-next-line no-param-reassign
					value[name || 'unknown'] = values[`${index}`];

					return value;
				}, {})
			);
		},
		[params, onChange]
	);

	return (
		<Params
			params={params}
			onChange={onParamsChange}
			values={paramValues}
		/>
	);
}

export default StructComp;
