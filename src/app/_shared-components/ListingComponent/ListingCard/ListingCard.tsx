// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import { EProposalType } from '@/_shared/types';
import Address from '../../Profile/Address/Address';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import styles from './ListingCard.module.scss';
import StatusTag from '../../StatusTag/StatusTag';

function ListingCard({
	title,
	onChainInfo: { proposer, createdAt, origin, status },
	backgroundColor,
	proposalType,
	index
}: {
	title: string;
	onChainInfo: { proposer: string; createdAt: string; origin: string; status: string };
	backgroundColor: string;
	proposalType: string;
	index: number;
}) {
	const formattedCreatedAt = dayjs(createdAt).fromNow();

	return (
		<div
			className={styles.listingCard}
			style={{ backgroundColor }}
		>
			<div className='flex items-start lg:gap-4'>
				<p className={styles.indexText}>#{index}</p>
				<div className='flex flex-col gap-1'>
					<h3 className={styles.titleText}>{title}</h3>
					<div className={styles.infoContainer}>
						<span>
							<Address address={proposer} />
						</span>
						<span>|</span>
						<span className={styles.infoItem}>
							<FaRegClock className={styles.infoIcon} />
							<span className={styles.infoTimer}> {formattedCreatedAt}</span>
						</span>
						{proposalType === EProposalType.DISCUSSION && (
							<span>
								<span>|</span>
								<span className={`${getSpanStyle(origin, 1)} ${styles.originStyle}`}>{origin}</span>
							</span>
						)}
					</div>
				</div>
			</div>
			<div>
				<StatusTag status={status} />
			</div>
		</div>
	);
}

export default ListingCard;
