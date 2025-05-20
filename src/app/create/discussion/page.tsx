// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import CreateDiscussionComponent from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Create Discussion`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Create Discussion`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Create Discussion'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Create Discussion'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/create/discussion`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Create Discussion`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
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
