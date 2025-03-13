// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import privacyPolicyContent from './privacy-policy';
import { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Privacy Policy - Polkassembly',
  description: 'Privacy Policy for Polkassembly'
};

export default async function PrivacyPolicyPage() {
  // Get the host from headers to determine the network
  const headersList = await headers();
  const host = headersList.get('host') || 'polkassembly.io';
  
  // Extract network from the host
  // For example, 'kusama.polkassembly.io' -> 'kusama'
  let network = '';
  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'app') {
      network = parts[0];
    }
  }
  
  // Replace all instances of 'polkassembly.io' with '{network}.polkassembly.io'
  let policyContent = privacyPolicyContent;
  if (network) {
    policyContent = policyContent.replace(
      /https:\/\/polkassembly\.io/g, 
      `https://${network}.polkassembly.io`
    );
  }
  
  return (
    <div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
      <div className='bg-white rounded-md shadow p-8'>
        <h1 className='text-2xl font-semibold mb-6'>Privacy Policy</h1>
        <div className='markdown-content whitespace-pre-line'>
          {policyContent}
        </div>
      </div>
    </div>
  );
} 