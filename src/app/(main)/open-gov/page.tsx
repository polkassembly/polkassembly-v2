// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ENetwork } from '@shared/enum';
import Link from 'next/link';
import { getAllReferenda } from './ssr-actions/getAllReferenda';

export default async function OpenGov() {
	const data = await getAllReferenda(ENetwork.ROCOCO);
	if (!data) {
		return <div>No Referenda found</div>;
	}

	return (
		<div>
			{data.map((post) => (
				<Link
					href={`/referenda/${post.postId}`}
					key={post.postId}
				>
					<div className='border-2 p-2'>
						<h2>{post.title}</h2>
						<p>{post.content}</p>
						<p>{post.hash}</p>
						<p>{post.proposer}</p>
						<p>{post.postId}</p>
					</div>
				</Link>
			))}
		</div>
	);
}
