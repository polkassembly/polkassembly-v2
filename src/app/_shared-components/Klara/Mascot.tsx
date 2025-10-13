// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { mascotGifs, MascotGif } from '@/_shared/_constants/mascots';
import Image from 'next/image';

interface MascotProps {
	type: 'welcome' | 'loading' | 'error' | null;
}

const getRandomGifUrl = (type: MascotProps['type']): string | null => {
	const relevantGifs = mascotGifs.filter((gif: MascotGif) => gif.type === type);
	if (relevantGifs.length === 0) return null;
	const randomIndex = Math.floor(Math.random() * relevantGifs.length);
	return relevantGifs[randomIndex].url;
};

function Mascot({ type }: MascotProps) {
	const mascotUrl = getRandomGifUrl(type);

	if (!mascotUrl) {
		return null;
	}

	return (
		<div className='animate-fade-in mb-4 flex justify-start'>
			<div className='flex items-end space-x-2'>
				<div className='p-1'>
					<Image
						src={mascotUrl}
						alt={`${type} mascot`}
						className='h-auto w-28'
						width={112}
						height={112}
					/>
				</div>
			</div>
		</div>
	);
}

export default Mascot;
