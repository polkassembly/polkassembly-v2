// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { Tabs, TabsContent } from '@ui/Tabs';
import { ECommunityRole } from '@/_shared/types';
import Header from './Header/Header';
import DecentralisedVoices from './DecentralisedVoices/DecentralisedVoices';

interface ICommunityProps {
	activeTab: ECommunityRole;
}

function Community({ activeTab }: ICommunityProps) {
	return (
		<div>
			<Tabs
				className='m-0 p-0'
				value={activeTab}
			>
				{activeTab !== ECommunityRole.DVS && <Header activeTab={activeTab} />}

				<TabsContent
					className='m-0 p-0'
					value={ECommunityRole.DVS}
				>
					<DecentralisedVoices />
				</TabsContent>

				{activeTab !== ECommunityRole.DVS && <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16' />}
			</Tabs>
		</div>
	);
}

export default Community;
