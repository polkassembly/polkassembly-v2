// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Separator } from '@/app/_shared-components/Separator';
import CreateProposalComponent from './Components/CreateProposal';

function CreateProposal() {
	return (
		<div className='flex h-full w-full items-start justify-center p-8 sm:p-20'>
			<div className='mx-auto w-full max-w-screen-lg rounded-lg bg-bg_modal p-6 shadow-lg'>
				<div className='mb-4 text-lg font-semibold text-text_primary'>New Proposal</div>
				<Separator className='my-4' />
				<CreateProposalComponent />
			</div>
		</div>
	);
}

export default CreateProposal;
