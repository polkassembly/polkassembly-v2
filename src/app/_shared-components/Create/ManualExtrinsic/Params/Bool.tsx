// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

function Bool({ onChange }: { onChange: (value: boolean) => void }) {
	const t = useTranslations();
	const options = useRef([
		{ text: t('CreatePreimage.no'), value: false },
		{ text: t('CreatePreimage.yes'), value: true }
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
			<DropdownMenuTrigger>
				<div>{current ? t('CreatePreimage.yes') : t('CreatePreimage.no')}</div>
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
