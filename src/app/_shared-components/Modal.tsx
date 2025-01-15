// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import { useRouter } from 'next/navigation';

function Modal({ children }: { children: ReactNode }) {
	const router = useRouter();

	const handleOpenChange = () => router.back();
	return (
		<Dialog
			defaultOpen
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-xl font-semibold text-text_primary'>Login to Polkassembly</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}

export default Modal;
