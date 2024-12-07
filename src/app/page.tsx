// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Button } from '@/app/_shared-components/Button/Button';

export default function Home() {
	return (
		<div className='text-center leading-10'>
			Polkassembly <Button variant='secondary'>hello</Button>{' '}
		</div>
	);
}
