// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { LoadingSpinner } from './_shared-components/LoadingSpinner';

interface LoadingProps {
	size?: 'small' | 'medium' | 'large';
	show?: boolean;
	message?: string;
}

function Loading({ size = 'medium', show = true, message = 'Loading...' }: LoadingProps) {
	return (
		<section className='flex min-h-[25vh] flex-col items-center justify-center'>
			<LoadingSpinner
				size={size}
				show={show}
				message={message}
			/>
		</section>
	);
}

export default Loading;
