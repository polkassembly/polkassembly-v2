// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { privacyPolicyContent } from './privacy-policy';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Privacy Policy`,
		description: 'Explore Polkassembly Privacy Policy',
		network,
		url: `https://${network}.polkassembly.io/privacy`,
		imageAlt: 'Polkassembly Privacy Policy'
	});
}

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
