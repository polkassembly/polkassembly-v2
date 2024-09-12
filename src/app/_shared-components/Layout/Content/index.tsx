// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { PropsWithChildren } from 'react';
import Footer from '../Footer';

function Content({ children }: PropsWithChildren) {
	return (
		<div className='no-scrollbar flex basis-11/12 flex-col items-center justify-between gap-5 overflow-x-auto'>
			<div className='container'>{children}</div>
			<Footer />
		</div>
	);
}

export default Content;
