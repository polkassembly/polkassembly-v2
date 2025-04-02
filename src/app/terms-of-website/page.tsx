// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { termsOfWebsiteContent } from './terms-of-website';
import { MarkdownEditor } from '../_shared-components/MarkdownEditor/MarkdownEditor';

export const metadata: Metadata = {
	title: 'Terms of Website - Polkassembly',
	description: 'Terms of Website Use for Polkassembly'
};

export default async function TermsOfWebsitePage() {
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
			<div className='rounded-md bg-white p-8 shadow'>
				<h1 className='mb-6 text-2xl font-semibold'>Terms of Website</h1>
				<MarkdownEditor
					markdown={termsOfWebsiteContent}
					readOnly
				/>
			</div>
		</div>
	);
}
