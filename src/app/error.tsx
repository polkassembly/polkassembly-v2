// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Button } from '@/components/ui/button';
// TODO: Replace this Button import with Shadcn Ui's Button component
// import { Button } from '@nextui-org/button';
import Link from 'next/link';
import React from 'react';

function RootError({ error, reset }: { error: Error; reset: () => void }) {
	return (
		// eslint-disable-next-line prettier/prettier
		<section className='flex min-h-[25vh] flex-col items-center justify-center gap-3 rounded-3xl border border-primary_border p-8'>
			<h2 className='font-semibold'>There was a problem :(</h2>
			{
				// eslint-disable-next-line prettier/prettier
				<p className='text-danger py-4'>{error.message || 'Please try again.'}</p>
			}
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
				<Button
					onClick={reset}
					color='primary'
					size='sm'
				>
					Try again
				</Button>
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

export default RootError;
