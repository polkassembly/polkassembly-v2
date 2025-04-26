// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { termsAndConditionsContent } from './terms-and-conditions';

export const metadata: Metadata = {
	title: 'Terms and Conditions - Polkassembly',
	description: 'Terms and Conditions for Polkassembly'
};

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
