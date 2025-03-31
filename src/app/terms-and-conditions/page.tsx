// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { termsAndConditionsContent } from './terms-and-conditions';
import { MarkdownEditor } from '../_shared-components/MarkdownEditor/MarkdownEditor';

export const metadata: Metadata = {
	title: 'Terms and Conditions - Polkassembly',
	description: 'Terms and Conditions for Polkassembly'
};

export default function TermsAndConditionsPage() {
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
			<div className='rounded-md bg-white p-8 shadow'>
				<h1 className='mb-6 text-2xl font-semibold'>Terms and Conditions</h1>
				<MarkdownEditor
					markdown={termsAndConditionsContent}
					readOnly
				/>
			</div>
		</div>
	);
}
