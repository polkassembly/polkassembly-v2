// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { termsAndConditionsContent } from './terms-and-conditions';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Terms and Conditions`,
		description: 'Explore Polkassembly Terms and Conditions',
		network,
		url: `https://${network}.polkassembly.io/terms-and-conditions`,
		imageAlt: 'Polkassembly Terms and Conditions'
	});
}

export default async function TermsAndConditionsPage() {
	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<div className='rounded-md bg-bg_modal p-8 shadow'>
				<h1 className='mb-6 text-2xl font-semibold'>Terms and Conditions</h1>
				<MarkdownViewer markdown={termsAndConditionsContent} />
			</div>
		</div>
	);
}
