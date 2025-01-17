// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React from 'react';

async function Referenda({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;

	return (
		<div className='h-full w-full bg-page_background'>
			<PostDetails index={index} />
		</div>
	);
}

export default Referenda;
