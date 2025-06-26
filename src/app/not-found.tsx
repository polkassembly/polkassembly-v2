// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import LostGIF from '@assets/gifs/lost.gif';
import Image from 'next/image';
import HomeLinkButton from './_shared-components/HomeLinkButton';

export default function NotFound() {
	return (
		<section className='flex min-h-full flex-col items-center justify-center gap-3 rounded-3xl border border-primary_border p-8'>
			<Image
				src={LostGIF}
				alt='404 - Lost'
				width={200}
				height={200}
			/>

			<h2 className='text-xl font-semibold'>Page Not Found</h2>
			<p className='text-text_secondary py-4'>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
			<small>
				Please check the URL or navigate back to continue browsing.{' '}
				<a
					href='mailto:hello@polkassembly.io'
					className='underline'
				>
					Contact support
				</a>{' '}
				if you believe this is an error.
			</small>
			<div className='mt-4 flex flex-col items-center gap-3'>
				<HomeLinkButton />
			</div>
		</section>
	);
}
