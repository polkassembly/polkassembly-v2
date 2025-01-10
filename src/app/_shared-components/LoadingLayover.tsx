// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

function LoadingLayover() {
	return (
		<div className='absolute inset-0 z-50 flex h-full w-full items-center justify-center rounded-lg bg-opacity-50 backdrop-blur-sm'>
			<LoadingSpinner />
		</div>
	);
}

export default LoadingLayover;
