// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback } from 'react';
import { IParamDef } from '@/_shared/types';
import { toAddress } from '@/app/_client-utils/toAddress';
import InputText from './InputText';

function AccountId20({ param, onChange, defaultValue }: { param: IParamDef; onChange: (value?: string) => void; defaultValue: string }) {
	const onParamChange = useCallback(
		(value: string): void => {
			const address = toAddress({
				value,
				bytesLength: 20
			});
			const output = address ? value : undefined;

			onChange(output);
		},
		[onChange]
	);

	return (
		<InputText
			onChange={onParamChange}
			defaultValue={defaultValue}
			param={param}
		/>
	);
}

export default AccountId20;
