// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-cycle
import Param from './Param';

function Params({ params, values, onChange }: { params: IParamDef[]; values?: unknown[]; onChange: (values: unknown[]) => void }) {
	const [paramValues, setParamValues] = useState<unknown[]>(values || []);

	const onParamChange = (index: number, value: unknown) => {
		setParamValues((prev) => {
			const newValues = [...prev];
			newValues[`${index}`] = value;
			return newValues;
		});
	};

	useEffect(() => {
		setParamValues(values || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	useEffect(() => {
		onChange(paramValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramValues]);

	return (
		<div className='flex flex-col gap-y-4 border-l-2 border-dashed border-border_grey pl-2'>
			{params &&
				params.map((param, index) => {
					return (
						<Param
							// eslint-disable-next-line react/no-array-index-key
							key={`${param.name}-${param.type.type}-${index}`}
							param={param}
							onChange={(value) => onParamChange(index, value)}
						/>
					);
				})}
		</div>
	);
}

export default Params;
