// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

function ReferendumCard({
	proposalType,
	network,
	onChainInfo: { createdAt, proposer, status, description }
}: {
	proposalType: string;
	network: string;
	onChainInfo: { createdAt: string; proposer: string; status: string; description: string };
}) {
	return (
		<div className='flex flex-col items-start justify-between border-b p-4 last:border-none md:flex-row md:items-center'>
			<div className='flex flex-col'>
				<h3 className='mb-2 text-lg font-semibold'>{description || proposalType}</h3>
				<p className='text-sm text-gray-500'>
					<strong>Proposer:</strong> {proposer} | <strong>Status:</strong> {status} | <strong>Network:</strong> {network}
				</p>
				<p className='text-sm text-gray-400'>
					<strong>Created:</strong> {new Date(createdAt).toLocaleDateString()}
				</p>
			</div>
			<div className='mt-2 flex items-center space-x-4 md:mt-0'>
				<span className='text-sm text-gray-500'>👍 3</span>
				<span className='text-sm text-gray-500'>💬 5</span>
			</div>
		</div>
	);
}

export default ReferendumCard;
