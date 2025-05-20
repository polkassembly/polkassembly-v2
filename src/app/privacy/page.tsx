// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { privacyPolicyContent } from './privacy-policy';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Privacy Policy`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Privacy Policy`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Privacy Policy'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Privacy Policy'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/privacy`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Privacy Policy`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

export const metadata: Metadata = {
	title: 'Privacy Policy - Polkassembly',
	description: 'Privacy Policy for Polkassembly'
};

export default async function PrivacyPolicyPage() {
	const network = await getNetworkFromHeaders();

	// Replace all instances of 'polkassembly.io' with '{network}.polkassembly.io'
	let policyContent = privacyPolicyContent;
	if (network) {
		policyContent = policyContent.replace(/https:\/\/polkassembly\.io/g, `https://${network}.polkassembly.io`);
	}

	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
			<div className='rounded-md bg-bg_modal p-8 shadow'>
				<h1 className='mb-6 text-2xl font-semibold'>Privacy Policy</h1>
				<MarkdownViewer markdown={policyContent} />
			</div>
		</div>
	);
}
