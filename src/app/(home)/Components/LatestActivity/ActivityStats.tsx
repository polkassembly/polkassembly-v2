// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import DOT from '@assets/delegation/dot.svg';
import votes from '@assets/delegation/votes.svg';
import tokens from '@assets/delegation/tokens.svg';
import Image from 'next/image';
import { BN, BN_ZERO } from '@polkadot/util';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AiFillQuestionCircle } from '@react-icons/all-files/ai/AiFillQuestionCircle';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';

function ActivityStats() {
	const t = useTranslations('Overview');
	const network = getCurrentNetwork() as ENetwork;

	const fetchOverviewStats = async () => {
		const { data: overviewStats, error: overviewStatsError } = await NextApiClientService.getOverviewStats();

		if (overviewStatsError || !overviewStats) {
			throw new ClientError(overviewStatsError?.message || 'Failed to fetch data');
		}
		return overviewStats;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['overviewStats'],
		queryFn: () => fetchOverviewStats(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const formattedVotes = data ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(data.weeklyVotesCount) : '0';
	const weeklySpends = data?.weeklySpends.reduce((acc, curr) => {
		return acc.add(new BN(curr.amount));
	}, BN_ZERO);
	const formattedSpends = data && weeklySpends ? formatBnBalance(weeklySpends, { withUnit: true, compactNotation: true, numberAfterComma: 1 }, network) : '0';

	const stats = [
		{
			title: t('activeProposals'),
			value: data?.activeProposalsCount || 0,
			icon: DOT
		},
		{
			title: t('totalVotes'),
			value: formattedVotes,
			icon: votes
		},
		{
			title: t('totalSpends'),
			value: formattedSpends,
			icon: tokens,
			tooltip: t('totalSpendsTooltip')
		}
	];

	return (
		<div className='grid grid-cols-1 gap-1 rounded-xl border border-border_grey bg-bg_modal p-3 md:grid-cols-3'>
			{stats.map((stat) => (
				<div
					key={stat.title}
					className='flex items-center gap-1'
				>
					<div className='shrink-0'>
						<Image
							src={stat.icon}
							alt={stat.title}
							width={24}
							height={24}
							className='h-10 w-10'
						/>
					</div>
					<div className='flex flex-col'>
						<div className='flex items-center gap-1'>
							<span className='text-xs font-medium text-wallet_btn_text'>{stat.title}</span>
							{stat.tooltip && (
								<Tooltip>
									<TooltipTrigger asChild>
										<AiFillQuestionCircle className='h-4 w-4 text-question_icon_color' />
									</TooltipTrigger>
									<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-center text-xs text-white'>
										<p>{stat.tooltip}</p>
									</TooltipContent>
								</Tooltip>
							)}
						</div>
						<div className='flex items-end gap-2'>
							{isFetching ? <Skeleton className='h-6 w-20' /> : <span className='text-xl font-semibold text-text_primary'>{stat.value}</span>}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default ActivityStats;
