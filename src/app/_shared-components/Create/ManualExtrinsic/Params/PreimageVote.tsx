// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback, useEffect, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

interface IVote {
	aye: boolean;
	conviction: number;
}

// const AYE_MASK = 0b10000000;
const EMPTY_VOTE: IVote = { aye: true, conviction: 0 };

function PreimageVoteComp({ onChange }: { onChange: (value: IVote) => void }) {
	const [vote, setVote] = useState(EMPTY_VOTE);

	useEffect((): void => {
		onChange(vote);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vote]);

	const onChangeVote = useCallback((aye: boolean) => setVote(({ conviction }) => ({ aye, conviction })), []);

	const onChangeConviction = useCallback((conviction: number) => setVote(({ aye }) => ({ aye, conviction })), []);

	const optAyeRef = useRef([
		{ text: 'Nay', value: false },
		{ text: 'Aye', value: true }
	]);

	const optConvRef = useRef([
		{ text: 'None', value: 0 },
		{ text: 'Locked1x', value: 1 },
		{ text: 'Locked2x', value: 2 },
		{ text: 'Locked3x', value: 3 },
		{ text: 'Locked4x', value: 4 },
		{ text: 'Locked5x', value: 5 },
		{ text: 'Locked6x', value: 6 }
	]);

	// const defaultVote = isBn(defaultValue)
	// ? !!(defaultValue.toNumber() && AYE_MASK)
	// : isNumber(defaultValue)
	// ? !!(defaultValue && AYE_MASK)
	// : defaultValue instanceof GenericVote
	// ? defaultValue.isAye
	// : !!defaultValue;
	// const defaultConv = defaultValue instanceof GenericVote ? defaultValue.conviction.index : 0;

	return (
		<div className='flex flex-col gap-y-2'>
			<DropdownMenu>
				<DropdownMenuTrigger>{vote.aye ? 'Aye' : 'Nay'}</DropdownMenuTrigger>
				<DropdownMenuContent>
					{optAyeRef.current.map((option) => (
						<DropdownMenuItem
							onClick={() => onChangeVote(option.value)}
							key={option.text}
							className='cursor-pointer'
						>
							{option.text}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<DropdownMenu>
				<DropdownMenuTrigger>{optConvRef.current[vote.conviction]?.text || 'None'}</DropdownMenuTrigger>
				<DropdownMenuContent>
					{optConvRef.current.map((option) => (
						<DropdownMenuItem
							onClick={() => onChangeConviction(option.value)}
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

export default PreimageVoteComp;
