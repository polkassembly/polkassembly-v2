// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { Separator } from '@ui/Separator';
import { EAssets, EPostDetailsTab, IPost, IPostListing } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Image from 'next/image';
import BeneficiaryIcon from '@assets/icons/beneficiary-icon.svg';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { BN } from '@polkadot/util';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import VotingProgress from '@/app/(home)/activity-feed/Components/VotingProgress/VotingProgress';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Address from '@ui/Profile/Address/Address';
import CreatedAtTime from '@ui/CreatedAtTime/CreatedAtTime';
import PostTags from '@ui/PostDetails/PostTags/PostTags';
import StatusTag from '@ui/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import Link from 'next/link';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { ArrowLeftIcon } from 'lucide-react';
import classes from './PostHeader.module.scss';
import { getSpanStyle } from '../../TopicTag/TopicTag';

function PostHeader({ postData, isModalOpen }: { postData: IPostListing | IPost; isModalOpen: boolean }) {
	const network = getCurrentNetwork();
	const t = useTranslations();

	const groupedByAsset = postData.onChainInfo?.beneficiaries?.reduce((acc: Record<string, number>, curr) => {
		const assetId = curr.assetId || NETWORKS_DETAILS[`${network}`].tokenSymbol;

		acc[`${assetId}`] = (acc[`${assetId}`] || 0) + Number(curr.amount);
		return acc;
	}, {});

	const ayeValue = new BN(postData.onChainInfo?.voteMetrics?.aye.value || '0');
	const nayValue = new BN(postData.onChainInfo?.voteMetrics?.nay.value || '0');
	const totalValue = ayeValue.add(nayValue);
	const ayePercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.aye.value || '0', totalValue);
	const nayPercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.nay.value || '0', totalValue);
	const decisionPeriodPercentage = postData.onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(postData.onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = postData.onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(postData.onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';

	const isOffchainPost = ValidatorService.isValidOffChainProposalType(postData.proposalType);

	const createdAt = postData.createdAt || postData.onChainInfo?.createdAt;

	return (
		<div className='mx-auto max-w-[100vw] lg:max-w-7xl'>
			<Link
				href={
					postData.onChainInfo?.origin
						? `/${postData.onChainInfo?.origin?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`
						: `/${postData.proposalType?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}s`
				}
				className='mb-4 flex items-center gap-x-1 text-xs text-listing_page_btn hover:underline'
			>
				<ArrowLeftIcon className='h-3 w-4' />
				View All {postData.onChainInfo?.origin ? `${convertCamelCaseToTitleCase(postData.onChainInfo?.origin || '')}` : `${postData.proposalType}`}
			</Link>

			<div className='mb-4'>
				<div className={classes.requestedWrapper}>
					{postData.onChainInfo?.beneficiaries && postData.onChainInfo?.beneficiaries.length > 0 && groupedByAsset && (
						<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
							<span className={classes.requestedText}>{t('PostDetails.requested')}:</span>
							<span className={classes.requestedAmount}>
								{Object.entries(groupedByAsset).map(([assetId, amount], i) => (
									<span
										className='flex items-center gap-x-1'
										key={assetId}
									>
										<span>
											{formatBnBalance(
												amount.toString(),
												{ withUnit: true, numberAfterComma: 2, compactNotation: true },
												network,
												assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
											)}
										</span>
										{i < Object.entries(groupedByAsset).length - 1 && <span className='text-text_primary'>&</span>}
									</span>
								))}
							</span>
							<Separator
								orientation='vertical'
								className='hidden h-4 lg:block'
							/>
						</div>
					)}
					{postData?.onChainInfo?.status && <StatusTag status={postData.onChainInfo.status.toLowerCase().replace(/\s+/g, '_')} />}
				</div>
				<p className={classes.postTitle}>{postData.title}</p>
				<div className={classes.proposerWrapper}>
					<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
						{postData?.onChainInfo?.proposer ? (
							<Address address={postData.onChainInfo?.proposer} />
						) : postData.publicUser?.username ? (
							<Link
								href={`/user/${postData.publicUser?.username}`}
								className='text-text_secondary text-xs'
							>
								{postData.publicUser?.username}
							</Link>
						) : null}

						{postData.onChainInfo?.origin && (
							<>
								<span className='text-xs text-wallet_btn_text'>{t('Search.in')}</span>
								<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${classes.originStyle}`}>
									{convertCamelCaseToTitleCase(postData.onChainInfo?.origin || '')}
								</span>
							</>
						)}

						{createdAt && (
							<>
								<Separator
									orientation='vertical'
									className='h-3'
								/>
								<CreatedAtTime createdAt={createdAt} />
							</>
						)}

						{postData.tags && postData.tags.length > 0 && (
							<div className='flex items-center gap-x-2'>
								<Separator
									orientation='vertical'
									className='h-3'
								/>
								<PostTags tags={postData.tags} />
							</div>
						)}
					</div>

					{postData?.onChainInfo?.beneficiaries && postData?.onChainInfo?.beneficiaries.length > 0 && (
						<div className={classes.beneficiaryWrapper}>
							<Separator
								orientation='vertical'
								className='hidden h-3 lg:block'
							/>
							<div className='flex items-center gap-x-1'>
								<Image
									src={BeneficiaryIcon}
									alt='Beneficiary'
									width={14}
									height={14}
									className='darkIcon'
								/>
								<span className={classes.beneficiaryText}>{t('PostDetails.beneficiary')}:</span>
							</div>

							{postData.onChainInfo?.beneficiaries?.slice(0, 2).map((beneficiary) => (
								<div
									key={`${beneficiary.amount}-${beneficiary.address}-${beneficiary.assetId}`}
									className='flex flex-wrap items-center gap-x-1 gap-y-2'
								>
									<Address address={beneficiary.address} />
									<span className='text-xs text-wallet_btn_text'>
										({formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network, beneficiary.assetId as EAssets)})
									</span>
								</div>
							))}

							{postData?.onChainInfo?.beneficiaries?.length > 2 && (
								<Tooltip>
									<TooltipTrigger>
										<span className='text-xs text-wallet_btn_text'>
											+ {postData.onChainInfo.beneficiaries.length - 2} {t('PostDetails.more')}{' '}
										</span>
									</TooltipTrigger>
									<TooltipContent className={classes.beneficiaryTooltipContent}>
										{postData?.onChainInfo?.beneficiaries?.slice(2).map((beneficiary) => (
											<div
												key={beneficiary.amount}
												className='flex flex-wrap items-center gap-x-1 gap-y-2'
											>
												<Address
													disableTooltip
													address={beneficiary.address}
												/>
												<span className='text-xs text-wallet_btn_text'>
													({formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network, beneficiary.assetId as EAssets)})
												</span>
											</div>
										))}
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					)}

					{postData?.onChainInfo?.voteMetrics && isModalOpen && (
						<div className='flex items-center gap-x-2'>
							<Separator
								orientation='vertical'
								className='hidden h-3 lg:block'
							/>
							<VotingProgress
								timeRemaining={timeRemaining}
								decisionPeriodPercentage={decisionPeriodPercentage}
								formattedTime={formattedTime}
								ayePercent={ayePercent}
								nayPercent={nayPercent}
								postData={postData}
							/>
						</div>
					)}
				</div>
			</div>

			<TabsList className={`mx-auto max-w-full overflow-auto pl-4 font-bold capitalize md:pl-0 ${classes.hideScrollbar}`}>
				<TabsTrigger value={EPostDetailsTab.DESCRIPTION}>{t('PostDetails.description')}</TabsTrigger>
				<TabsTrigger value={EPostDetailsTab.TIMELINE}>{t('PostDetails.timeline')}</TabsTrigger>
				{!isOffchainPost && <TabsTrigger value={EPostDetailsTab.ONCHAIN_INFO}>{t('PostDetails.onchainInfo')}</TabsTrigger>}
			</TabsList>
		</div>
	);
}

export default PostHeader;
