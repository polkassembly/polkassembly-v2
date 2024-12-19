// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import Address from '../../Profile/Address/Address';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import styles from './ListingCard.module.scss';

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
			className={styles.listingCard}
			style={{ backgroundColor }}
		>
			<div className='flex items-start gap-4'>
				<p className={styles.indexText}>#{index}</p>
				<div className='flex flex-col gap-1'>
					<h3 className={styles.titleText}>{title}</h3>
					<div className={styles.infoContainer}>
						<span>
							<Address address={proposer} />
						</span>
						<span>|</span>
						<span className={styles.infoItem}>
							<FaRegClock />
							{formattedCreatedAt}
						</span>
						<span>|</span>
						<span className={`${getSpanStyle(origin, 1)} ${styles.originStyle}`}>{origin}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ListingCard;
