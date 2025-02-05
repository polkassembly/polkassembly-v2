// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import React from 'react';

function Leaderboard({ data }: { data: IGenericListingResponse<IPublicUser> }) {
	return (
		<div className='bg-page_background px-8 pt-6 lg:px-12'>
			{data.items.map((item) => {
				// eslint-disable-next-line
				const createdAtSeconds = item.createdAt?._seconds;
				return (
					<div key={item.id}>
						<h1>{item.username}</h1>
						<h1>{item.rank}</h1>
						<h1>{createdAtSeconds ? dayjs(new Date(createdAtSeconds * 1000)).format("Do MMM 'YY") : ''}</h1>
					</div>
				);
			})}
		</div>
	);
}

export default Leaderboard;
