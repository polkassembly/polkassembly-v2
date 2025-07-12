// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React from 'react';
import { Button } from './Button';

function HomeLinkButton() {
	return (
		<Link href='/'>
			<Button color='primary'>Go to Home</Button>
		</Link>
	);
}

export default HomeLinkButton;
