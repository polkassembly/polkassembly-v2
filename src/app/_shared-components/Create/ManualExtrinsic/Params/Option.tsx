// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { useCallback } from 'react';
import { TypeDef } from '@polkadot/types/types';
// eslint-disable-next-line import/no-cycle
import Param from './Param';

function Option({ param, onChange }: { param: IParamDef; onChange: (value: unknown) => void }) {
	const { sub } = param.type;

	const onParamChange = useCallback(
		(value: unknown) => {
			onChange(value);
		},
		[onChange]
	);

	return (
		<div>
			{param.name}
			{sub && (
				<Param
					param={{
						name: param.name,
						type: sub as TypeDef
					}}
					onChange={(value) => {
						onParamChange(value);
					}}
				/>
			)}
		</div>
	);
}

export default Option;
