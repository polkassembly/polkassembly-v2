// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { PropsWithChildren } from 'react';
import Navbar from './Navbar';
import Content from './Content';

function Layout({ children }: PropsWithChildren) {
	return (
		<section className='flex h-screen w-full flex-col overflow-hidden'>
			<Navbar />
			<Content>{children}</Content>
		</section>
	);
}

export default Layout;
