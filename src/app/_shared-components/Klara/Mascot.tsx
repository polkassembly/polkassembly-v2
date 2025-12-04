// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { mascotGifs, MascotGif } from '@/_shared/_constants/mascots';
import Image from 'next/image';
import styles from './ChatUI.module.scss';

interface MascotProps {
	type: 'welcome' | 'loading' | 'error' | null;
}

const getRandomGifUrl = (type: MascotProps['type']): string | null => {
	const relevantGifs = mascotGifs.filter((gif: MascotGif) => gif.type === type);
	if (relevantGifs.length === 0) return null;
	const randomIndex = Math.floor(Math.random() * relevantGifs.length);
	const selectedGif = relevantGifs[randomIndex];
	return selectedGif?.url ?? null;
};

function Mascot({ type }: MascotProps) {
	const mascotUrl = getRandomGifUrl(type);

	if (!mascotUrl) {
		return null;
	}

	return (
		<div className='animate-fade-in mb-4 flex justify-start'>
			<div className='flex flex-col gap-2'>
				<div className={`p-1 ${type === 'loading' ? styles.klaraBreathing : ''}`}>
					<Image
						src={mascotUrl}
						alt={`${type} mascot`}
						className='h-auto w-28'
						width={112}
						height={112}
					/>
				</div>
				{type === 'loading' && (
					<div className='mb-4 w-fit rounded-lg bg-klara_ai_msg_bg px-3 py-2'>
						<div className={styles.klaraLoadingEllipsis}>
							<div />
							<div />
							<div />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Mascot;
