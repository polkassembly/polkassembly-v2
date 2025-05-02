// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { EAssets, EProposalType, ETheme, IPostListing, IPostOffChainMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import CommentIcon from '@assets/icons/Comment.svg';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Address from '@ui/Profile/Address/Address';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import StatusTag from '@ui/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { BN } from '@polkadot/util';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import Link from 'next/link';
import { getPostDetailsUrl } from '@/app/_client-utils/getPostDetailsUrl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ARCHIVE_PROPOSAL_TYPES } from '@/_shared/_constants/archiveProposalTypes';
import styles from './ListingCard.module.scss';
import VotingBar from '../VotingBar/VotingBar';

function ListingCard({
	title,
	data,
	backgroundColor,
	proposalType,
	metrics = { reactions: { like: 0, dislike: 0 }, comments: 0 },
	index
}: {
	title: string;
	data: IPostListing;
	backgroundColor: string;
	proposalType: EProposalType;
	metrics?: IPostOffChainMetrics;
	index: number;
}) {
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();

	const formattedCreatedAt = dayjs(data.createdAt || data.onChainInfo?.createdAt || new Date()).fromNow();
	const ayeValue = new BN(data.onChainInfo?.voteMetrics?.aye.value || '0');
	const nayValue = new BN(data.onChainInfo?.voteMetrics?.nay.value || '0');
	const totalValue = ayeValue.add(nayValue);
	const ayePercent = calculatePercentage(ayeValue.toString(), totalValue);
	const nayPercent = calculatePercentage(nayValue.toString(), totalValue);
	const decisionPeriodPercentage = data.onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(data.onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = data.onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(data.onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';

	const groupedByAsset = groupBeneficiariesByAsset(data.onChainInfo?.beneficiaries || [], network);

	const redirectUrl = getPostDetailsUrl({ proposalType, proposalId: index, network });

	return (
		<Link
			href={redirectUrl}
			className='w-full'
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (ARCHIVE_PROPOSAL_TYPES.includes(proposalType)) {
					window.open(redirectUrl, '_blank');
				} else {
					redirectFromServer(redirectUrl);
				}
			}}
		>
			<div className={`${styles.listingCard} ${backgroundColor}`}>
				<div className='flex items-start lg:gap-4'>
					<p className={styles.indexText}>#{index}</p>
					<div className='flex flex-col items-start gap-1'>
						<h3 className={styles.titleText}>{title}</h3>
						<div className={styles.infoContainer}>
							<div className='flex items-center gap-2'>
								{data.onChainInfo?.proposer && (
									<>
										<Address address={data.onChainInfo?.proposer} />
										<span>|</span>
									</>
								)}

								{!data.onChainInfo?.proposer && data.publicUser?.username && (
									<>
										<span>{data.publicUser?.username}</span>
										<span>|</span>
									</>
								)}

								{(data.onChainInfo?.createdAt || data.createdAt) && (
									<span className={styles.infoItem}>
										<FaRegClock className={styles.infoIcon} />
										<span className={styles.infoTimer}>{formattedCreatedAt}</span>
									</span>
								)}

								{ValidatorService.isValidOnChainProposalType(proposalType) && data.onChainInfo?.origin && (
									<>
										<span>|</span>
										<span className={`${getSpanStyle(data.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>
											{convertCamelCaseToTitleCase(data.onChainInfo?.origin || '')}
										</span>
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
										className={userPreferences.theme === ETheme.DARK ? 'dark-icons' : ''}
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
														Aye ={' '}
														{formatUSDWithUnits(
															formatBnBalance(data.onChainInfo?.voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
														)}{' '}
														({ayePercent.toFixed(2)}%)
													</p>
													<p>
														Nay ={' '}
														{formatUSDWithUnits(
															formatBnBalance(data.onChainInfo?.voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
														)}{' '}
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
					{data.onChainInfo?.beneficiaries && data.onChainInfo?.beneficiaries.length > 0 && groupBeneficiariesByAsset(data.onChainInfo?.beneficiaries, network) && (
						<div className={styles.beneficiaryContainer}>
							{Object.keys(groupedByAsset).length > 1 ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className='flex items-center gap-1'>
											<div className='flex items-center -space-x-1.5'>
												{Object.entries(groupedByAsset).map(([assetId]) => {
													const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || assetId;
													const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;
													return (
														<Image
															key={assetId}
															className='rounded-full'
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
								Object.entries(groupedByAsset).map(([assetId, amount]) => (
									<div
										className={styles.requestedAmount}
										key={assetId}
									>
										<span className='whitespace-nowrap'>
											{formatUSDWithUnits(
												formatBnBalance(
													amount.toString(),
													{ withUnit: true, numberAfterComma: 2 },
													network,
													assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
												)
											)}
										</span>
										<span className='block lg:hidden'>|</span>
									</div>
								))
							)}
						</div>
					)}

					{data.onChainInfo?.status && (
						<div className='flex'>
							<StatusTag status={data.onChainInfo?.status.toLowerCase().replace(/\s+/g, '_')} />
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

export default ListingCard;
