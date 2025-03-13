// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import termsOfWebsiteContent from './terms-of-website';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Website - Polkassembly',
  description: 'Terms of Website Use for Polkassembly'
};

export default function TermsOfWebsitePage() {
  return (
    <div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
      <div className='bg-white rounded-md shadow p-8'>
        <h1 className='text-2xl font-semibold mb-6'>Terms of Website</h1>
        <div className='markdown-content whitespace-pre-line'>
          {termsOfWebsiteContent}
        </div>
      </div>
    </div>
  );
} 