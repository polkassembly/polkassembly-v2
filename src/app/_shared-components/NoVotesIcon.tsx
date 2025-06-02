// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';

export function NoVotesIcon() {
	return (
		<Image
			src='/assets/icons/no-votes.svg'
			alt='No votes icon'
			width={48}
			height={48}
		/>
	);
}
