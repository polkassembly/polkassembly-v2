// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import LoadingSpinner from '@/components/Misc/LoadingSpinner';
import React from 'react';

function Loading() {
	return (
		<section className='flex min-h-[25vh] flex-col items-center justify-center'>
			<LoadingSpinner />
		</section>
	);
}

export default Loading;
