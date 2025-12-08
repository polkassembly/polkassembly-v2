// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { BN } from '@polkadot/util';
import Image from 'next/image';
import CommentIcon from '@assets/icons/Comment.svg';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import Address from '@ui/Profile/Address/Address';
import StatusTag from '@ui/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { IPostListing, IPostOffChainMetrics, ETheme } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
import { ARCHIVE_PROPOSAL_TYPES } from '@/_shared/_constants/archiveProposalTypes';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { groupBeneficiariesByAssetIndex } from '@/app/_client-utils/beneficiaryUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import UserAvatar from '@/app/_shared-components/UserAvatar/UserAvatar';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import VotingBar from '@/app/_shared-components/ListingComponent/VotingBar/VotingBar';
import { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

function ActivityItem({ rowData }: { rowData: IPostListing }) {
	const t = useTranslations('Overview');
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();

	if (!rowData) return null;

	const { title, proposalType, index, onChainInfo, createdAt, publicUser } = rowData;
	const metrics = rowData.metrics as IPostOffChainMetrics;

	const formattedCreatedAt = dayjs(createdAt || onChainInfo?.createdAt || new Date()).fromNow();
	const ayeValue = new BN(onChainInfo?.voteMetrics?.aye.value || '0');
	const nayValue = new BN(onChainInfo?.voteMetrics?.nay.value || '0');
	const totalValue = ayeValue.add(nayValue);
	const ayePercent = calculatePercentage(ayeValue.toString(), totalValue);
	const nayPercent = calculatePercentage(nayValue.toString(), totalValue);
	const decisionPeriodPercentage = onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `${t('decidingEnds')} ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : t('decisionPeriodEnded');

	const groupedByAsset = groupBeneficiariesByAssetIndex({ beneficiaries: onChainInfo?.beneficiaries || [], network });

	const redirectUrl = getPostTypeUrl({ proposalType, indexOrHash: index ?? onChainInfo?.hash ?? 0, network });

	const handleClick = (e: MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (ARCHIVE_PROPOSAL_TYPES.includes(proposalType)) {
			window.open(redirectUrl, '_blank');
		} else {
			redirectFromServer(redirectUrl);
		}
	};

	return (
		<Link
			href={redirectUrl}
			className='block w-full border-b border-border_grey last:border-0 hover:bg-bg_modal/80'
			onClick={handleClick}
		>
			<div className='flex items-start gap-3 py-4'>
				<p className='text-text_secondary pt-0.5 text-sm font-medium'>#{index}</p>

				<div className='flex w-full items-start justify-between gap-4'>
					<div className='flex w-full flex-col gap-1.5'>
						<h3 className='line-clamp-2 text-sm font-medium text-text_primary md:text-base'>{title}</h3>
						<div className='text-text_secondary flex flex-wrap items-center gap-1 text-xs'>
							<div className='flex items-center gap-1'>
								{onChainInfo?.proposer ? (
									<Address
										address={onChainInfo.proposer}
										textClassName='truncate max-w-[80px] text-text_secondary'
										iconSize={16}
									/>
								) : (
									<UserAvatar
										publicUser={publicUser}
										textClassName='text-text_secondary'
									/>
								)}
							</div>
							<span className='text-text_secondary hidden md:inline'>|</span>
							<div className='flex items-center gap-1'>
								<FaRegClock className='text-text_secondary' />
								<span>{formattedCreatedAt}</span>
							</div>
							<div className='hidden items-center gap-1 md:flex'>
								<span className='text-text_secondary mx-1'>|</span>
								<Image
									src={CommentIcon}
									alt='comments'
									width={14}
									height={14}
									className={userPreferences.theme === ETheme.DARK ? 'darkIcon opacity-60' : 'opacity-60'}
								/>
								<span>{metrics?.comments || 0}</span>
							</div>

							{timeRemaining && (timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0) && (
								<div className='hidden items-center gap-1 md:flex'>
									<span className='text-text_secondary mx-1'>|</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className='w-7'>
												<Progress
													value={decisionPeriodPercentage}
													className='h-1.5 max-w-7 bg-decision_bar_bg'
												/>
											</div>
										</TooltipTrigger>
										<TooltipContent side='top'>
											<p className='text-xs'>{formattedTime}</p>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							{(ayePercent > 0 || nayPercent > 0) && (
								<div className='hidden items-center gap-1 md:flex'>
									<span className='text-text_secondary mx-1'>|</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className='min-w-[100px]'>
												<VotingBar
													ayePercent={ayePercent}
													nayPercent={nayPercent}
												/>
											</div>
										</TooltipTrigger>
										<TooltipContent side='top'>
											<div className='text-xs'>
												<p>
													{t('aye')}: {ayePercent.toFixed(1)}%
												</p>
												<p>
													{t('nay')}: {nayPercent.toFixed(1)}%
												</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							<div className='mt-2 flex w-full justify-between gap-1 md:hidden'>
								{onChainInfo?.beneficiaries && onChainInfo.beneficiaries.length > 0 && groupedByAsset && (
									<div className='flex items-center'>
										{Object.entries(groupedByAsset).map(([assetId, amount]) => (
											<span
												key={assetId}
												className='text-xs font-medium text-text_primary'
											>
												{formatBnBalance(
													amount.toString(),
													{ withUnit: true, numberAfterComma: 2, compactNotation: true },
													network,
													assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
												)}
											</span>
										))}
									</div>
								)}
								{onChainInfo?.status && <StatusTag status={onChainInfo.status} />}
							</div>
						</div>
					</div>
					<div className='hidden shrink-0 flex-col items-end gap-2 md:flex'>
						{onChainInfo?.beneficiaries && onChainInfo.beneficiaries.length > 0 && groupedByAsset && (
							<div className='flex items-center justify-end'>
								{Object.entries(groupedByAsset).map(([assetId, amount]) => (
									<div
										key={assetId}
										className='flex items-center gap-1 text-sm font-medium text-text_primary'
									>
										<span>
											{formatBnBalance(
												amount.toString(),
												{ withUnit: true, numberAfterComma: 2, compactNotation: true },
												network,
												assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
											)}
										</span>
									</div>
								))}
							</div>
						)}

						{onChainInfo?.status && <StatusTag status={onChainInfo.status} />}
					</div>
				</div>
			</div>
		</Link>
	);
}

export default ActivityItem;
