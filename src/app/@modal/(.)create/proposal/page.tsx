// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React from 'react';
import { useRouter } from 'next/navigation';
import CreateProposal from '@/app/create/proposal/Components/CreateProposal';

function Proposal() {
	const router = useRouter();

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='max-w-xl overflow-y-auto p-6'>
				<DialogHeader>
					<DialogTitle>Create Proposal</DialogTitle>
				</DialogHeader>
				<div className='px-4'>
					<CreateProposal />
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Proposal;
