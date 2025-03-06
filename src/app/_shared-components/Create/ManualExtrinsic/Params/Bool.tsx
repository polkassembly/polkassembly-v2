// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

function Bool({ onChange }: { onChange: (value: unknown) => void }) {
	const options = useRef([
		{ text: 'No', value: false },
		{ text: 'Yes', value: true }
	]);

	const [current, setCurrent] = useState<boolean>(false);

	const onBoolChange = useCallback(
		(value: boolean) => {
			setCurrent(value);
			onChange(value);
		},
		[onChange]
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className='w-full rounded border border-border_grey px-4 py-2'
			>
				<div>{current ? 'Yes' : 'No'}</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{options.current.map((option) => (
					<DropdownMenuItem
						key={option.text}
						onClick={() => onBoolChange(option.value)}
					>
						{option.text}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default Bool;
