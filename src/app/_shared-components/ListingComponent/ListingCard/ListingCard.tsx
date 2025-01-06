// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import { EProposalType, IOnChainPostListing, IPostOffChainMetrics } from '@/_shared/types';
import Link from 'next/link';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import CommentIcon from '@assets/icons/Comment.svg';
import Address from '../../Profile/Address/Address';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import styles from './ListingCard.module.scss';
import StatusTag from '../../StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import VotingBar from '../VotingBar/VotingBar';

const calculatePercentage = (value: string, totalValue: bigint) => {
	if (totalValue === BigInt(0)) return 0;
	const valueBI = BigInt(value);
	return Number((valueBI * BigInt(100) * BigInt(100)) / totalValue) / 100;
};

function ListingCard({
	title,
	onChainInfo: { proposer, createdAt, origin, status, voteMetrics },
	backgroundColor,
	proposalType,
	metrics = { reactions: { like: 0, dislike: 0 }, comments: 0 },
	index
}: {
	title: string;
	onChainInfo: IOnChainPostListing;
	backgroundColor: string;
	proposalType: string;
	metrics?: IPostOffChainMetrics;
	index: number;
}) {
	const network = getCurrentNetwork();
	const formattedCreatedAt = dayjs(createdAt).fromNow();
	const totalValue = BigInt(voteMetrics?.aye.value || '0') + BigInt(voteMetrics?.nay.value || '0');

	const ayePercent = calculatePercentage(voteMetrics?.aye.value || '0', totalValue);
	const nayPercent = calculatePercentage(voteMetrics?.nay.value || '0', totalValue);

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
						<span>|</span>
						<div className={styles.commentContainer}>
							<Image
								src={CommentIcon}
								alt='voting_bar'
								width={16}
								height={16}
							/>
							<span>{metrics?.comments || 0}</span>
						</div>

						<span>|</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<VotingBar
										ayePercent={ayePercent}
										nayPercent={nayPercent}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent
								side='top'
								align='center'
							>
								<div className={styles.progressBarContainer}>
									<p>
										Aye = {formatUSDWithUnits(formatBnBalance(voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
										{ayePercent.toFixed(2)}%)
									</p>
									<p>
										Nay = {formatUSDWithUnits(formatBnBalance(voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
										{nayPercent.toFixed(2)}%)
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
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
