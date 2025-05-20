// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import CreateComponent from './Components/Create';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Create Post`,
		description: 'Create a new discussion on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/create`,
		imageAlt: 'Polkassembly Create Post'
	});
}

async function Create() {
	return (
		<div className='flex h-full w-full items-start justify-center p-8 sm:p-20'>
			<div className='mx-auto w-full max-w-screen-lg rounded-lg bg-bg_modal p-4 shadow-lg sm:p-6'>
				<CreateComponent />
			</div>
		</div>
	);
}

export default Create;
