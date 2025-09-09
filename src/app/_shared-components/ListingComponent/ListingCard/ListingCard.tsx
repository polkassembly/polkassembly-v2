// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { EAssets, EGovType, EProposalType, ETheme, IPostListing, IPostOffChainMetrics } from '@/_shared/types';
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
import { groupBeneficiariesByAssetIndex } from '@/app/_client-utils/beneficiaryUtils';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { BN } from '@polkadot/util';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import Link from 'next/link';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ARCHIVE_PROPOSAL_TYPES } from '@/_shared/_constants/archiveProposalTypes';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import VotingBar from '../VotingBar/VotingBar';
import styles from './ListingCard.module.scss';
import UserAvatar from '../../UserAvatar/UserAvatar';

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
	const t = useTranslations();

	const formattedCreatedAt = dayjs(data.createdAt || data.onChainInfo?.createdAt || new Date()).fromNow();
	const ayeValue = new BN(data.onChainInfo?.voteMetrics?.aye.value || '0');
	const nayValue = new BN(data.onChainInfo?.voteMetrics?.nay.value || '0');
	const totalValue = ayeValue.add(nayValue);
	const ayePercent = calculatePercentage(ayeValue.toString(), totalValue);
	const nayPercent = calculatePercentage(nayValue.toString(), totalValue);
	const decisionPeriodPercentage = data.onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(data.onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = data.onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(data.onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';

	const groupedByAsset = groupBeneficiariesByAssetIndex({ beneficiaries: data.onChainInfo?.beneficiaries || [], network });

	const redirectUrl = ARCHIVE_PROPOSAL_TYPES.includes(proposalType)
		? getPostTypeUrl({ proposalType, indexOrHash: index, network, govType: EGovType.GOV_1 })
		: getPostTypeUrl({ proposalType, indexOrHash: index, network });

	const renderMobileBeneficiaries = () => {
		if (!data.onChainInfo?.beneficiaries || data.onChainInfo.beneficiaries.length === 0) return null;

		return (
			<div className='flex items-center gap-1'>
				{Object.keys(groupedByAsset).length > 1 ? (
					<div className='flex items-center gap-1'>
						<span className='text-sm font-bold text-text_primary'>{t('Profile.Delegations.multiple')}</span>
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
										width={16}
										height={16}
									/>
								);
							})}
						</div>
					</div>
				) : (
					Object.entries(groupedByAsset).map(([assetId, amount]) => (
						<div
							className='text-sm font-bold text-text_primary'
							key={assetId}
						>
							<span className='whitespace-nowrap'>
								{formatBnBalance(
									amount.toString(),
									{ withUnit: true, numberAfterComma: 0, compactNotation: true },
									network,
									assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
								)}
							</span>
						</div>
					))
				)}
			</div>
		);
	};

	const renderMobileVoting = () => {
		if (!(ayePercent > 0 && nayPercent > 0)) return null;

		return (
			<div className='space-y-2'>
				<div className='w-full'>
					<VotingBar
						ayePercent={ayePercent}
						nayPercent={nayPercent}
						variant='linear'
					/>
				</div>
				<div className='flex items-center justify-between text-xs font-medium text-wallet_btn_text'>
					<span>
						{t('PostDetails.Aye')}: {ayePercent.toFixed(0)}%
					</span>
					<span>{t('PostDetails.ToPass')}: 50%</span>
					<span>
						{t('PostDetails.Nay')}: {nayPercent.toFixed(0)}%
					</span>
				</div>
			</div>
		);
	};

	const renderDesktopVoting = () => {
		if (!(ayePercent > 0 && nayPercent > 0)) return null;

		return (
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
								{t('PostDetails.Aye')} ={' '}
								{formatUSDWithUnits(
									formatBnBalance(data.onChainInfo?.voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
								)}{' '}
								({ayePercent.toFixed(2)}%)
							</p>
							<p>
								{t('PostDetails.Nay')} ={' '}
								{formatUSDWithUnits(
									formatBnBalance(data.onChainInfo?.voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
								)}{' '}
								({nayPercent.toFixed(2)}%)
							</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</>
		);
	};

	const renderDesktopBeneficiaries = () => {
		if (!data.onChainInfo?.beneficiaries || data.onChainInfo.beneficiaries.length === 0) return null;

		return (
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
							</div>
						</TooltipTrigger>
						<TooltipContent
							side='top'
							align='center'
							className='m-0 p-0'
						>
							<div className={styles.assetContainer}>
								{Object.entries(groupedByAsset).map(([assetId, amount]) => {
									const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || assetId;
									const assetParam = unit === NETWORKS_DETAILS[`${network}`]?.tokenSymbol ? null : assetId;
									return <div key={assetId}>{formatUSDWithUnits(formatBnBalance(amount.toString(), { withUnit: true, numberAfterComma: 2 }, network, assetParam))}</div>;
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
								{(() => {
									const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || assetId;
									const assetParam = unit === NETWORKS_DETAILS[`${network}`]?.tokenSymbol ? null : assetId;
									return formatUSDWithUnits(formatBnBalance(amount.toString(), { withUnit: true, numberAfterComma: 2 }, network, assetParam));
								})()}
							</span>
						</div>
					))
				)}
			</div>
		);
	};

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
				<div className='block w-full lg:hidden'>
					<div className='mb-3 flex w-full items-center justify-between border-b border-mob_proposal_index_border pb-2'>
						<div className='flex items-center gap-2'>
							<p className='rounded-lg bg-mob_proposal_index_bg px-2 py-0.5 text-[10px] font-semibold text-wallet_btn_text'>#{index}</p>
							{data.onChainInfo?.status && (
								<StatusTag
									className='rounded-lg px-2 py-0.5 text-[10px]'
									status={data.onChainInfo?.status}
								/>
							)}
						</div>
						<div className='flex items-center gap-2'>
							{renderMobileBeneficiaries()}
							<div className={cn(styles.commentContainer, 'rounded-lg bg-mob_discussion_comment_bg px-2 py-0.5')}>
								<Image
									src={CommentIcon}
									alt='comments'
									width={14}
									className={userPreferences.theme === ETheme.DARK ? 'darkIcon' : ''}
									height={14}
								/>
								<span className='text-[10px] text-text_primary'>{metrics?.comments || 0}</span>
							</div>
						</div>
					</div>

					<div className='mb-3 flex items-center gap-2 text-xs text-text_primary'>
						{data.onChainInfo?.proposer ? <Address address={data.onChainInfo?.proposer} /> : <UserAvatar publicUser={data.publicUser} />}
						{ValidatorService.isValidOnChainProposalType(proposalType) && data.onChainInfo?.origin && (
							<span className={`${getSpanStyle(data.onChainInfo?.origin || '', 1)} rounded px-2 py-1 text-xs font-semibold`}>
								{convertCamelCaseToTitleCase(data.onChainInfo?.origin || '')}
							</span>
						)}
						{(data.onChainInfo?.createdAt || data.createdAt) && (
							<>
								<span className='text-gray-400'>|</span>
								<div className='flex items-center gap-1'>
									<FaRegClock className='h-3 w-3' />
									<span className='whitespace-nowrap text-xs'>{formattedCreatedAt}</span>
								</div>
							</>
						)}
					</div>

					<h3 className='mb-3 text-sm font-medium leading-tight text-btn_secondary_text'>{title}</h3>

					{renderMobileVoting()}
				</div>

				<div className='hidden items-start lg:flex lg:gap-4'>
					<p className={styles.indexText}>#{index}</p>
					<div className='flex flex-col items-start gap-1'>
						<h3 className={styles.titleText}>{title}</h3>
						<div className={styles.infoContainer}>
							<div className='flex items-center gap-2'>
								{data.onChainInfo?.proposer ? (
									<>
										<Address address={data.onChainInfo?.proposer} />
										<span>|</span>
									</>
								) : (
									<>
										<UserAvatar publicUser={data.publicUser} />
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
										className={userPreferences.theme === ETheme.DARK ? 'darkIcon' : ''}
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

								{renderDesktopVoting()}
							</div>
						</div>
					</div>
				</div>

				<div className={`hidden lg:flex ${styles.tagContainer}`}>
					{renderDesktopBeneficiaries()}

					{data.onChainInfo?.status && (
						<div className='flex'>
							<StatusTag status={data.onChainInfo?.status} />
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

export default ListingCard;
