// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import { EProposalType, IOnChainPostListing } from '@/_shared/types';
import Link from 'next/link';
import Address from '../../Profile/Address/Address';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import styles from './ListingCard.module.scss';
import StatusTag from '../../StatusTag/StatusTag';

const formatDOTValue = (value: string) => {
	const num = Number(value);
	if (isNaN(num)) return '0.0';
	return (num / 1e10).toFixed(1);
};

const calculatePercentage = (count: number, totalCount: number) => {
	if (totalCount === 0) return 50;
	return (count / totalCount) * 100;
};

function HalfCircleProgressBar({ ayePercent, nayPercent }: { ayePercent: number; nayPercent: number }) {
	const width = 120;
	const height = 60;
	const strokeWidth = 8;
	const radius = 50;

	const createArc = (percentage: number, isAye: boolean) => {
		const x = isAye ? 10 + (width - 20) * (percentage / 100) : width - 10 - (width - 20) * (percentage / 100);
		const centerX = width / 2;
		const y = height - Math.sqrt(radius * radius - (x - centerX) ** 2);

		return `
            M ${isAye ? 10 : width - 10} ${height}
            A ${radius} ${radius} 0 0 ${isAye ? 1 : 0}
            ${x} ${y}
        `;
	};

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={styles.progressBar}
		>
			<path
				d={`M 10 ${height} A ${radius} ${radius} 0 0 1 ${width - 10} ${height}`}
				fill='none'
				stroke='#d3d3d3'
				strokeWidth={strokeWidth}
			/>

			<path
				d={createArc(ayePercent, true)}
				fill='none'
				stroke='#27d57b'
				strokeWidth={strokeWidth}
				strokeLinecap='butt'
			/>
			<path
				d={createArc(nayPercent, false)}
				fill='none'
				stroke='#fc3e5d'
				strokeWidth={strokeWidth}
				strokeLinecap='butt'
			/>
		</svg>
	);
}

function ListingCard({
	title,
	onChainInfo: { proposer, createdAt, origin, status, voteMetrics },
	backgroundColor,
	proposalType,
	index
}: {
	title: string;
	onChainInfo: IOnChainPostListing;
	backgroundColor: string;
	proposalType: string;
	index: number;
}) {
	const formattedCreatedAt = dayjs(createdAt).fromNow();
	const totalVoteCount = (voteMetrics?.aye.count || 0) + (voteMetrics?.nay.count || 0);

	const ayePercent = calculatePercentage(voteMetrics?.aye.count || 0, totalVoteCount);
	const nayPercent = calculatePercentage(voteMetrics?.nay.count || 0, totalVoteCount);

	console.log(voteMetrics);

	return (
		<Link
			href={`/referenda/${index}`}
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
					<p>{formatDOTValue(voteMetrics?.aye.value || '0')} </p>
					<p>{formatDOTValue(voteMetrics?.nay.value || '0')} </p>
					<div className={styles.progressBarContainer}>
						<HalfCircleProgressBar
							ayePercent={ayePercent}
							nayPercent={nayPercent}
						/>
					</div>
				</div>
			</div>
			<div>
				<StatusTag status={status} />
			</div>
		</Link>
	);
}

export default ListingCard;
