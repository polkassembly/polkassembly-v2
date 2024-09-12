// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ServerComponentProps } from '@shared/types';
import React from 'react';
import { ENetwork } from '@shared/enum';
import { getReferenda } from './ssr-actions/getReferenda';

interface IParams {
	index: string;
}

export default async function Referenda({ params }: ServerComponentProps<IParams, null>) {
	const { index } = params || {};
	if (!index || isNaN(Number(index))) return <div>No Referenda Found</div>;
	const data = await getReferenda(ENetwork.ROCOCO, Number(index));
	if (!data) {
		return <div>No Referenda found</div>;
	}

	return (
		<div>
			Referenda {index}
			<div className='border-2 p-2'>
				<h2>{data.title}</h2>
				<p>{data.content}</p>
				<p>{data.hash}</p>
				<p>{data.proposer}</p>
				<p>{data.postId}</p>
			</div>
		</div>
	);
}
