// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import CreateDiscussionComponent from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';

async function Discussion() {
	return (
		<div className='flex h-full w-full items-start justify-center p-8 sm:p-10'>
			<div className='mx-auto w-full max-w-screen-lg rounded-lg bg-bg_modal p-4 shadow-lg sm:p-6'>
				<CreateDiscussionComponent />
			</div>
		</div>
	);
}

export default Discussion;
