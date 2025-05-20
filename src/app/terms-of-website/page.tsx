// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { termsOfWebsiteContent } from './terms-of-website';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Terms of Website`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Terms of Website`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Terms of Website'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Terms of Website'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/terms-of-website`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Terms of Website`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

export const metadata: Metadata = {
	title: 'Terms of Website - Polkassembly',
	description: 'Terms of Website Use for Polkassembly'
};

export default async function TermsOfWebsitePage() {
	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<div className='rounded-md bg-bg_modal p-8 shadow'>
				<MarkdownViewer markdown={termsOfWebsiteContent} />
			</div>
		</div>
	);
}
