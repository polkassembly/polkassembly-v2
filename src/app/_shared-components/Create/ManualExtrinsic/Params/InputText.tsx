// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputHTMLAttributes } from 'react';
import { IParamDef } from '@/_shared/types';
import { Input } from '../../../Input';

type InputTextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange?: (value: string) => void;
	param?: IParamDef;
};

function InputText({ onChange, ...props }: InputTextProps) {
	return (
		<Input
			type='text'
			onChange={(e) => {
				onChange?.(e.target.value);
			}}
			{...props}
		/>
	);
}

export default InputText;
