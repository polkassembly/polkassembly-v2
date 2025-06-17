// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<section className='flex min-h-screen flex-col items-center justify-center gap-3 bg-[#1C1D1F] p-8 text-white'>
			<h2 className='font-semibold'>There was a problem :(</h2>
			<p className='text-danger py-4'>{error.message || 'Please try again.'}</p>
			<small>
				Please try again or{' '}
				<a
					href='mailto:hello@polkassembly.io'
					className='underline'
				>
					contact support
				</a>{' '}
				if the problem persists.
			</small>
			<div className='flex flex-col items-center gap-3'>
				<Link
					href='/'
					className='text-sm underline'
				>
					Go to home
				</Link>
			</div>
		</section>
	);
}
