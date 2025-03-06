// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputHTMLAttributes, useCallback, useState } from 'react';
import { IParamDef } from '@/_shared/types';
import { compactAddLength } from '@polkadot/util';
import { Button } from '../../../Button';
import InputText from './InputText';
import InputFile from './InputFile';

type BytesInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (value: unknown) => void;
	param: IParamDef;
};

function BytesInput({ onChange, ...props }: BytesInputProps) {
	const [isFileDrop, setIsFileDrop] = useState(false);

	const onFileChange = useCallback(
		(value: Uint8Array): void => {
			onChange(compactAddLength(value));
		},
		[onChange]
	);

	return (
		<div>
			<div className='flex w-full justify-end'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => setIsFileDrop(!isFileDrop)}
				>
					file
				</Button>
			</div>
			{isFileDrop ? (
				<div className='flex flex-col gap-y-1'>
					<InputFile onChange={onFileChange} />
				</div>
			) : (
				<InputText
					onChange={(value) => {
						onChange(value);
					}}
					{...props}
				/>
			)}
		</div>
	);
}

export default BytesInput;
