// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputHTMLAttributes } from 'react';
import { IParamDef } from '@/_shared/types';
import { Input } from '../../../Input';

type InputNumberProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (value: number) => void;
	param?: IParamDef;
};

function InputNumber({ onChange, ...props }: InputNumberProps) {
	return (
		<Input
			type='number'
			onChange={(e) => {
				onChange(Number(e.target.value));
			}}
			{...props}
		/>
	);
}

export default InputNumber;
