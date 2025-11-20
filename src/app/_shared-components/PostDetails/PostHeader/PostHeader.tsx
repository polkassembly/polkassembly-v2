// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { Separator } from '@ui/Separator';
import { EPostDetailsTab, IPost } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
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
import Link from 'next/link';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import SummariseIcon from '@/_assets/icons/summarise.svg';
import { ArrowLeftIcon, ChevronsRight } from 'lucide-react';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
import { POST_ANALYTICS_ENABLED_PROPOSAL_TYPE } from '@/_shared/_constants/postAnalyticsConstants';
import { getPostListingUrl } from '@/app/_client-utils/getPostListingUrl';
import { cn } from '@/lib/utils';
import classes from './PostHeader.module.scss';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import UserAvatar from '../../UserAvatar/UserAvatar';

function PostHeader({ postData, isModalOpen }: { postData: IPost; isModalOpen: boolean }) {
	const network = getCurrentNetwork();
	const t = useTranslations();

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
		<div className='mx-auto w-full lg:max-w-7xl'>
			<div className='mb-4 flex items-center gap-x-1 px-4 sm:px-6'>
				<ArrowLeftIcon className='h-3 w-4' />
				<Link
					href={getPostListingUrl({ proposalType: postData.proposalType, origin: postData.onChainInfo?.origin })}
					className='flex items-center gap-x-1 text-xs text-listing_page_btn hover:underline'
				>
					View All {postData.onChainInfo?.origin ? `${convertCamelCaseToTitleCase(postData.onChainInfo?.origin || '')}` : `${postData.proposalType}`}
				</Link>

				{postData?.linkedPost?.proposalType && postData.proposalType && (
					<>
						<Separator
							orientation='vertical'
							className='mx-1 h-3 w-[2px]'
						/>
						<Link
							href={getPostTypeUrl({ proposalType: postData.linkedPost?.proposalType, indexOrHash: Number(postData.linkedPost?.indexOrHash), network })}
							className='flex items-center gap-x-1 text-xs text-listing_page_btn hover:underline'
						>
							<span className='text-text_secondary'>{t(`PostDetails.ProposalType.${postData.linkedPost.proposalType.toLowerCase()}`)}</span>
							<span className='text-text_primary'>#{postData.linkedPost?.indexOrHash}</span>
						</Link>

						<ChevronsRight className='h-3.5 w-3.5 text-lg text-basic_text' />

						<div className='flex items-center gap-x-1 text-xs text-text_pink'>
							<span className='capitalize'>{t(`PostDetails.ProposalType.${postData.proposalType.toLowerCase()}`)}</span>
							<span>#{postData?.index}</span>
						</div>
					</>
				)}
			</div>
			<div className='mb-4 px-4 sm:px-6'>
				<p className={classes.postTitle}>{postData.title}</p>
				<div className={classes.proposerWrapper}>
					<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
						{postData?.onChainInfo?.proposer ? <Address address={postData.onChainInfo?.proposer} /> : <UserAvatar publicUser={postData.publicUser} />}

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
						<Separator
							orientation='vertical'
							className='hidden h-3 lg:block'
						/>
						{postData?.onChainInfo?.status && <StatusTag status={postData.onChainInfo.status} />}
					</div>

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

			<div className={cn('w-full overflow-x-auto', classes.scrollbarHide)}>
				<TabsList className='flex flex-nowrap items-center gap-1 p-0 py-2 font-bold sm:justify-start sm:gap-2'>
					<TabsTrigger
						className='flex-shrink-0 px-1 py-1 text-[11px] sm:px-3 sm:py-2 sm:text-sm'
						value={EPostDetailsTab.DESCRIPTION}
					>
						{t('PostDetails.description')}
					</TabsTrigger>

					{!isOffchainPost && (
						<TabsTrigger
							className='flex-shrink-0 px-1 py-1 text-[11px] sm:px-3 sm:py-2 sm:text-sm'
							value={EPostDetailsTab.ONCHAIN_INFO}
						>
							{t('PostDetails.onchainInfo')}
						</TabsTrigger>
					)}

					{POST_ANALYTICS_ENABLED_PROPOSAL_TYPE.includes(postData.proposalType) && (
						<TabsTrigger
							className='flex-shrink-0 px-1 py-1 text-[11px] sm:px-3 sm:py-2 sm:text-sm'
							value={EPostDetailsTab.POST_ANALYTICS}
						>
							{t('PostDetails.analytics')}
						</TabsTrigger>
					)}

					<TabsTrigger
						className='flex-shrink-0 px-1 py-1 text-[11px] sm:px-3 sm:py-2 sm:text-sm'
						value={EPostDetailsTab.AAG}
					>
						{t('PostDetails.aag')}
					</TabsTrigger>

					<TabsTrigger
						value={EPostDetailsTab.SUMMARISE}
						className={cn('flex-shrink-0 px-1 py-1 text-[11px] capitalize sm:px-3 sm:py-2 sm:text-sm', classes.tabTrigger)}
					>
						<div className={classes.summariseTabContent}>
							<Image
								src={SummariseIcon}
								alt='summarise'
								width={16}
								height={16}
								className={classes.summariseTabIcon}
							/>
							<span>{t('PostDetails.summarise')}</span>
						</div>
					</TabsTrigger>
				</TabsList>
			</div>
		</div>
	);
}

export default PostHeader;
