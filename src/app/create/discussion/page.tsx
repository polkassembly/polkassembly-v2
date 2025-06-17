// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import CreateDiscussionComponent from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Create Discussion`,
		description: 'Create a new discussion on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/create/discussion`,
		imageAlt: 'Polkassembly Create Discussion'
	});
}

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
