// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import Address from '../Profile/Address/Address';
import { getSpanStyle } from '../TopicTag/TopicTag';

function ListingCard({
	title,
	onChainInfo: { proposer, createdAt, origin },
	backgroundColor,
	index
}: {
	title: string;
	onChainInfo: { proposer: string; createdAt: string; origin: string };
	backgroundColor: string;
	index: number;
}) {
	const formattedCreatedAt = dayjs(createdAt).fromNow();

	return (
		<div
			className='flex flex-col items-start justify-between p-6 md:flex-row md:items-center'
			style={{ backgroundColor }}
		>
			<div className='flex items-start gap-4'>
				<p className='ml-5 w-14 text-sidebar_text'>#{index}</p>
				<div className='flex flex-col gap-1'>
					<h3 className='font-medium text-btn_secondary_text'>{title}</h3>
					<div className='flex items-center gap-2 text-sm text-gray-500'>
						<span>
							<Address address={proposer} />
						</span>
						<span>|</span>
						<span className='flex items-center gap-1 text-xs'>
							<FaRegClock />
							{formattedCreatedAt}
						</span>
						<span>|</span>
						<span className={`${getSpanStyle(origin, 1)} rounded-md px-1.5 py-1 text-xs`}>{origin}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ListingCard;
