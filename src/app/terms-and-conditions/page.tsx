// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import termsAndConditionsContent from './terms-and-conditions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Polkassembly',
  description: 'Terms and Conditions for Polkassembly'
};

export default function TermsAndConditionsPage() {
  return (
    <div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
      <div className='bg-white rounded-md shadow p-8'>
        <h1 className='text-2xl font-semibold mb-6'>Terms and Conditions</h1>
        <div className='markdown-content whitespace-pre-line'>
          {termsAndConditionsContent}
        </div>
      </div>
    </div>
  );
} 