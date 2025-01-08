// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from 'react-icons/fa6';
import { EProposalType, ETheme, IOnChainPostListing, IPostOffChainMetrics } from '@/_shared/types';
import Link from 'next/link';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import CommentIcon from '@assets/icons/Comment.svg';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Address from '@ui/Profile/Address/Address';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import StatusTag from '@ui/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { Progress } from '@ui/progress';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import USDTIcon from '@assets/icons/usdt.svg';
import USDCIcon from '@assets/icons/usdc.svg';
import { useTheme } from 'next-themes';
import DOTIcon from '@assets/icons/dot.png';
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
	const { resolvedTheme: theme } = useTheme();
	const formattedCreatedAt = dayjs(createdAt).fromNow();
	const totalValue = BigInt(voteMetrics?.aye.value || '0') + BigInt(voteMetrics?.nay.value || '0');
	const ayePercent = calculatePercentage(voteMetrics?.aye.value || '0', totalValue);
	const nayPercent = calculatePercentage(voteMetrics?.nay.value || '0', totalValue);
	const ICONS = {
		usdc: USDCIcon,
		usdt: USDTIcon,
		dot: DOTIcon
	};
	const decisionPeriodPercentage = decisionPeriodEndsAt ? calculateDecisionProgress(decisionPeriodEndsAt) : 0;

	const timeRemaining = decisionPeriodEndsAt ? getTimeRemaining(decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';

	const groupedByAsset = groupBeneficiariesByAsset(beneficiaries, network);
	return (
		<Link
			href={`/referenda/${index}`}
			className={`${styles.listingCard} ${backgroundColor}`}
		>
			<div className='flex items-start lg:gap-4'>
				<p className={styles.indexText}>#{index}</p>
				<div className='flex flex-col gap-1'>
					<h3 className={styles.titleText}>{title}</h3>
					<div className={styles.infoContainer}>
						<div className='flex items-center gap-2'>
							<Address address={proposer} />
							<span>|</span>
							<span className={styles.infoItem}>
								<FaRegClock className={styles.infoIcon} />
								<span className={styles.infoTimer}>{formattedCreatedAt}</span>
							</span>
							{proposalType === EProposalType.DISCUSSION && (
								<>
									<span>|</span>
									<span className={`${getSpanStyle(origin, 1)} ${styles.originStyle}`}>{origin}</span>
								</>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<div className={styles.commentContainer}>
								<span className='hidden lg:block'>|</span>
								<Image
									src={CommentIcon}
									alt='comments'
									width={16}
									className={theme === ETheme.DARK ? 'dark-icons' : ''}
									height={16}
								/>
								<span className='text-text_primary'>{metrics?.comments || 0}</span>
							</div>
							{timeRemaining && (
								<>
									<span>|</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className='flex items-center gap-1'>
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
												<p>{formattedTime}</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</>
							)}
							{ayePercent > 0 && nayPercent > 0 && (
								<>
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
													Aye = {formatUSDWithUnits(formatBnBalance(voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))}{' '}
													({ayePercent.toFixed(2)}%)
												</p>
												<p>
													Nay = {formatUSDWithUnits(formatBnBalance(voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))}{' '}
													({nayPercent.toFixed(2)}%)
												</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className={styles.tagContainer}>
				<div className='flex'>
					<StatusTag status={status} />
				</div>
				{beneficiaries && beneficiaries.length > 0 && groupBeneficiariesByAsset(beneficiaries, network) && (
					<div className={styles.beneficiaryContainer}>
						{beneficiaries.length > 1 ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className='flex items-center gap-1'>
										<div className='flex items-center -space-x-1.5'>
											{Object.entries(groupedByAsset).map(([assetId]) => {
												const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || assetId;
												const icon = ICONS[unit.toLowerCase() as keyof typeof ICONS] || DOTIcon;
												return (
													<Image
														key={assetId}
														src={icon}
														alt={unit}
														width={18}
														height={18}
													/>
												);
											})}
										</div>
										<span className='block lg:hidden'>|</span>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side='top'
									align='center'
								>
									<div className={styles.assetContainer}>
										{Object.entries(groupedByAsset).map(([assetId, amount]) => {
											return (
												<div key={assetId}>
													~{' '}
													{formatUSDWithUnits(
														formatBnBalance(
															amount.toString(),
															{ withUnit: true, numberAfterComma: 2 },
															network,
															assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
														)
													)}{' '}
												</div>
											);
										})}
									</div>
								</TooltipContent>
							</Tooltip>
						) : (
							Object.entries(groupedByAsset).map(([assetId, amount], i) => (
								<div
									className={styles.requestedAmount}
									key={assetId}
								>
									<span>
										{formatUSDWithUnits(
											formatBnBalance(amount.toString(), { withUnit: true, numberAfterComma: 2 }, network, assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId)
										)}
									</span>
									{i < Object.entries(groupedByAsset).length - 1 && <span className='text-text_primary'>&</span>}
									<span className='block lg:hidden'>|</span>
								</div>
							))
						)}
					</div>
				)}
			</div>
		</Link>
	);
}

export default ListingCard;
