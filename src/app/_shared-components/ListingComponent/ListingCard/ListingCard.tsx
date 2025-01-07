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
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Address from '@ui/Profile/Address/Address';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import StatusTag from '@ui/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { Progress } from '@ui/progress';
import styles from './ListingCard.module.scss';
import VotingBar from '../VotingBar/VotingBar';

const calculatePercentage = (value: string | number, totalValue: bigint | number) => {
	if (typeof totalValue === 'bigint') {
		if (totalValue === BigInt(0)) return 0;
		const valueBI = BigInt(value);
		return Number((valueBI * BigInt(100) * BigInt(100)) / totalValue) / 100;
	}
	if (totalValue === 0) return 0;
	return (Number(value) * 100) / totalValue;
};

function ListingCard({
	title,
	onChainInfo: { proposer, createdAt, origin, status, voteMetrics, decisionPeriodEndsAt, beneficiaries },
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

	const groupedByAsset = beneficiaries?.reduce((acc: Record<string, number>, curr) => {
		const assetId = curr.assetId || NETWORKS_DETAILS[`${network}`].tokenSymbol;

		acc[`${assetId}`] = (acc[`${assetId}`] || 0) + Number(curr.amount);
		return acc;
	}, {});

	const getTimeRemaining = (endDate: Date | string) => {
		const now = dayjs();
		const end = dayjs(endDate);
		const diff = end.diff(now);
		if (diff <= 0) return null;
		const duration = dayjs.duration(diff);
		const days = Math.floor(duration.asDays());
		const hours = Math.floor(duration.hours());
		const minutes = Math.floor(duration.minutes());

		return `Deciding ends in ${days}d : ${hours}hrs : ${minutes}mins`;
	};

	const calculateDecisionProgress = () => {
		if (!decisionPeriodEndsAt) return 0;
		const now = dayjs();
		const endDate = dayjs(decisionPeriodEndsAt);
		const startDate = endDate.subtract(28, 'days');
		if (now.isAfter(endDate)) return 100;
		if (now.isBefore(startDate)) return 0;
		return (now.diff(startDate, 'minutes') / (28 * 24 * 60)) * 100;
	};

	const decisionPeriodPercentage = calculateDecisionProgress();
	const timeRemaining = decisionPeriodEndsAt ? getTimeRemaining(decisionPeriodEndsAt) : null;

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
						<div>
							{timeRemaining && (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className='flex items-center gap-1'>
											<span>|</span>
											<div className='w-8'>
												<Progress
													value={decisionPeriodPercentage}
													className='h-1.5 bg-decision_bar_bg'
												/>
											</div>
										</div>
									</TooltipTrigger>
									<TooltipContent
										side='top'
										align='center'
									>
										<div className={styles.timeBarContainer}>
											<p>{timeRemaining}</p>
										</div>
									</TooltipContent>
								</Tooltip>
							)}
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
			<div className='flex flex-col items-end gap-1'>
				<div className='flex'>
					<StatusTag status={status} />
				</div>
				{beneficiaries && beneficiaries.length > 0 && groupedByAsset && (
					<div className='flex flex-wrap items-center gap-x-2'>
						<span className={styles.requestedAmount}>
							{Object.entries(groupedByAsset).map(([assetId, amount], i) => (
								<div key={assetId}>
									<span>
										{formatUSDWithUnits(
											formatBnBalance(amount.toString(), { withUnit: true, numberAfterComma: 2 }, network, assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId)
										)}
									</span>
									{i < Object.entries(groupedByAsset).length - 1 && <span className='text-text_primary'>&</span>}
								</div>
							))}
						</span>
					</div>
				)}
			</div>
		</Link>
	);
}

export default ListingCard;
