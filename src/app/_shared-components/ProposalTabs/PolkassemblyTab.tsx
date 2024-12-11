// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import ReferendumCard from '../ReferendumCard/ReferendumCard';

interface PolkassemblyTabProps {
	data: Array<{
		id: string;
		proposalType: string;
		network: string;
		onChainInfo: {
			createdAt: string;
			proposer: string;
			status: string;
			description: string;
		};
	}>;
}

function PolkassemblyTab({ data }: PolkassemblyTabProps) {
	return (
		<div>
			<div className='rounded-lg bg-white shadow'>
				{data?.map((item, index) => (
					<ReferendumCard
						key={item.id || `${item.proposalType}-${item.onChainInfo.createdAt}-${index}`} // Unique key fallback
						{...item}
					/>
				))}
			</div>
			<div className='mt-6 flex items-center justify-center space-x-2'>
				<button
					type='button'
					className='rounded bg-gray-200 px-4 py-2'
				>
					1
				</button>
				<button
					type='button'
					className='rounded bg-gray-200 px-4 py-2'
				>
					2
				</button>
				<span className='px-4 py-2'>...</span>
				<button
					type='button'
					className='rounded bg-gray-200 px-4 py-2'
				>
					10
				</button>
			</div>
		</div>
	);
}

export default PolkassemblyTab;
