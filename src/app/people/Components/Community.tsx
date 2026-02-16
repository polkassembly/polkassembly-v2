// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Tabs, TabsContent } from '@ui/Tabs';
import { ECommunityRole } from '@/_shared/types';
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
				<TabsContent
					className='m-0 p-0'
					value={ECommunityRole.DVS}
				>
					<DecentralisedVoices />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default Community;
