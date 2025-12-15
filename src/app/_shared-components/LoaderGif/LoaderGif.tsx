// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import loader1 from '@assets/gifs/loader/loader1.gif';
import loader2 from '@assets/gifs/loader/loader2.gif';
import loader3 from '@assets/gifs/loader/loader3.gif';

const loaders = [loader1, loader2, loader3];

interface ILoaderGifProps {
	message?: string;
	className?: string;
}

function LoaderGif({ message, className = '' }: ILoaderGifProps) {
	const t = useTranslations('Common');
	const [currentLoaderIndex, setCurrentLoaderIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentLoaderIndex((prev) => (prev + 1) % loaders.length);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	const displayMessage = message || t('loadingMessage');

	return (
		<div className={`flex min-h-[400px] flex-col items-center justify-center gap-6 ${className}`}>
			<div className='relative h-[200px] w-[200px]'>
				<Image
					src={loaders[currentLoaderIndex]}
					alt='Loading...'
					fill
					className='object-contain'
					priority
					unoptimized
				/>
			</div>
			<p className='text-center text-lg font-medium text-text_primary'>{displayMessage}</p>
		</div>
	);
}

export default LoaderGif;
