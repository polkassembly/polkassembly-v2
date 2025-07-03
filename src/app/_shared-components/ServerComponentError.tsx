// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import HomeLinkButton from './HomeLinkButton';

function ServerComponentError({ errorMsg }: { errorMsg?: string }) {
	return (
		<div className='min-h-full text-center text-text_primary'>
			{errorMsg || 'Failed to load data.'}
			<HomeLinkButton />
		</div>
	);
}

export default ServerComponentError;
