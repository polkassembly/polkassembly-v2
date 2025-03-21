// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { convertMarkdownToHtml } from '@/_shared/_utils/convertMarkdownToHtml';
import termsOfWebsiteContent from './terms-of-website';
import BlockEditor from '../_shared-components/BlockEditor/BlockEditor';

export const metadata: Metadata = {
	title: 'Terms of Website - Polkassembly',
	description: 'Terms of Website Use for Polkassembly'
};

const towContent = convertMarkdownToHtml(termsOfWebsiteContent);

export default function TermsOfWebsitePage() {
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
			<div className='rounded-md bg-white p-8 shadow'>
				<h1 className='mb-6 text-2xl font-semibold'>Terms of Website</h1>
				<BlockEditor
					data={towContent}
					readOnly
					renderFromHtml
					className='max-h-screen w-full'
				/>
			</div>
		</div>
	);
}
