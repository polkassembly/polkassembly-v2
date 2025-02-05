// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import React from 'react';

function Leaderboard({ data }: { data: IGenericListingResponse<IPublicUser> }) {
	return (
		<div className='flex flex-col gap-4'>
			{data.items.map((item) => (
				<div key={item.id}>
					<h1>{item.username}</h1>
					<h1>{item.rank}</h1>
					<h1>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</h1>
				</div>
			))}
		</div>
	);
}

export default Leaderboard;
