// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { termsOfWebsiteContent } from './terms-of-website';

export const metadata: Metadata = {
	title: 'Terms of Website - Polkassembly',
	description: 'Terms of Website Use for Polkassembly'
};

export default async function TermsOfWebsitePage() {
	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 p-5 sm:px-10'>
			<div className='rounded-md bg-bg_modal p-8 shadow'>
				<MarkdownViewer markdown={termsOfWebsiteContent} />
			</div>
		</div>
	);
}
