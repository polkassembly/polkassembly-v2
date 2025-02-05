// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import React from 'react';
import Cup from '@assets/leaderboard/cup.svg';
import Image from 'next/image';
import styles from './Leaderboard.module.scss';

function Leaderboard({ data }: { data: IGenericListingResponse<IPublicUser> }) {
	return (
		<div className='bg-page_background px-8 pt-6 lg:px-12'>
			<div className={styles.Card}>
				<div className='flex items-center justify-center'>
					<Image
						src={Cup}
						alt='Cup'
						className='absolute left-72 top-8 h-56 w-56'
						width={100}
						height={100}
					/>
					<div className='flex flex-col gap-0.5 text-center'>
						<p className='text-4xl font-semibold text-white'>Leaderboard</p>
						<p className='text-xl text-white'>Find your rank in the ecosystem</p>
					</div>
				</div>
			</div>

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
