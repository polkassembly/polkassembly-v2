// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogHeader } from '@ui/Dialog';

function Modal({ children }: { children: ReactNode }) {
	console.log('DIalog', Dialog);

	return (
		<Dialog defaultOpen>
			<DialogContent className='w-auto overflow-y-auto bg-white'>
				<DialogHeader>
					<DialogTitle className='text-text_primary text-xl font-semibold'>Treasury Distribution</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}

export default Modal;
