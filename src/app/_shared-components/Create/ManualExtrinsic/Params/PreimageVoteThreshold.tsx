// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

type TextMap = Record<number, string>;

const options = [
	{ text: 'Super majority approval', value: 0 },
	{ text: 'Super majority rejection', value: 1 },
	{ text: 'Simple majority', value: 2 }
];

export const textMap = options.reduce(
	(tMap, { text, value }): TextMap => {
		// eslint-disable-next-line no-param-reassign
		tMap[`${value}`] = text;

		return tMap;
	},
	{} as unknown as TextMap
);

function PreimageVoteThresholdComp({ onChange }: { onChange: (value: number) => void }) {
	const [voteThreshold, setVoteThreshold] = useState(0);

	useEffect(() => {
		onChange(voteThreshold);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voteThreshold]);

	return (
		<div className='flex flex-col gap-y-2'>
			<DropdownMenu>
				<DropdownMenuTrigger>{textMap[`${voteThreshold}`]}</DropdownMenuTrigger>
				<DropdownMenuContent>
					{options.map((option) => (
						<DropdownMenuItem
							onClick={() => setVoteThreshold(option.value)}
							key={option.text}
							className='cursor-pointer'
						>
							{option.text}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default PreimageVoteThresholdComp;
