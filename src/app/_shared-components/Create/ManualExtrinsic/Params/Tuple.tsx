// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import React, { useCallback, useMemo } from 'react';
// eslint-disable-next-line import/no-cycle
import Params from '.';

function Tuple({ param, onChange }: { param: IParamDef; onChange: (value: unknown) => void }) {
	const { apiService } = usePolkadotApiService();

	const params = useMemo(() => {
		return apiService?.getPreimageParamsFromTypeDef({ type: param.type }) || [];
	}, [apiService, param.type]);

	const onParamsChange = useCallback(
		(values: unknown[]): void => {
			onChange(values.map((value) => value));
		},
		[onChange]
	);
	return (
		<Params
			params={params}
			onChange={onParamsChange}
		/>
	);
}

export default Tuple;
