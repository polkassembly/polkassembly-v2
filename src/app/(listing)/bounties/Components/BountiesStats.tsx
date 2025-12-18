// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IBountyStats } from '@/_shared/types';
import tokens from '@assets/delegation/tokens.svg';
import DOT from '@assets/delegation/dot.svg';
import votes from '@assets/delegation/votes.svg';
import delegates from '@assets/delegation/delegates.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image, { StaticImageData } from 'next/image';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

interface StatItemProps {
	icon: StaticImageData;
	label: string;
	value: string | number | undefined;
	className?: string;
}

function StatItem({ icon, label, value, className }: StatItemProps) {
	return (
		<div className={`flex items-center gap-4 ${className || ''}`}>
			<Image
				src={icon}
				alt={label}
				className='h-10 w-10'
			/>
			<div>
				<p className='text-wallet-btn_text text-xs font-medium'>{label}</p>
				<div className='flex items-baseline gap-2'>
					<h3 className='text-xl font-semibold text-text_primary'>{value ?? '-'}</h3>
				</div>
			</div>
		</div>
	);
}

function BountiesStats() {
	const [stats, setStats] = useState<IBountyStats | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const network = getCurrentNetwork();
	const [totalBountyPool, setTotalBountyPool] = useState<string | null>(null);
	const [tokenPrice, setTokenPrice] = useState<number>(0);

	useEffect(() => {
		const fetchStats = async () => {
			const { data: bountiesStats } = await NextApiClientService.fetchBountiesStats();
			console.log('Bounties Stats:', { bountiesStats });
			const to = new Date();
			const from = new Date();
			from.setHours(to.getHours() - 2);
			const { data: treasuryStats } = await NextApiClientService.getTreasuryStats({ from, to });
			const tokenPrice = treasuryStats?.[0]?.nativeTokenUsdPrice;
			setTokenPrice(tokenPrice ? parseFloat(tokenPrice) : 0);
			const bountyPool = treasuryStats?.[0]?.bounties?.nativeToken ?? '0';
			console.log('Treasury Stats:', { treasuryStats, bountyPool, tokenPrice });
			setTotalBountyPool(bountyPool);
			if (bountiesStats) {
				setStats(bountiesStats);
			}
			setLoading(false);
		};
		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className='grid w-full grid-cols-1 gap-4 rounded-lg border border-border_grey bg-bg_modal p-6 md:grid-cols-4'>
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className='border-section-light-container dark:border-separatorDark flex items-center gap-4 border-r last:border-0'
					>
						<div className='h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
						<div className='space-y-2'>
							<div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
							<div className='h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
						</div>
					</div>
				))}
			</div>
		);
	}

	const formattedBountyPool = totalBountyPool
		? formatBnBalance(totalBountyPool, { withThousandDelimitor: false, withUnit: true, numberAfterComma: 0, compactNotation: true }, network)
		: '0';

	const formattedTotalRewarded = stats?.totalRewarded ? formatTokenValue(stats.totalRewarded, network, tokenPrice, NETWORKS_DETAILS[`${network}`].tokenSymbol) : '-';

	return (
		<div className='w-full rounded-xl border border-border_grey bg-bg_modal p-6 shadow-sm'>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
				<StatItem
					icon={tokens}
					label='Active Bounties'
					value={stats?.activeBounties}
					className='border-b border-border_grey pb-4 md:border-b-0 md:border-r md:px-4 md:pb-0 lg:border-r'
				/>
				<StatItem
					icon={DOT}
					label='Active Bounty Value'
					value={formattedBountyPool}
					className='border-b border-border_grey pb-4 md:border-b-0 md:border-r md:px-4 md:pb-0 lg:border-r'
				/>
				<StatItem
					icon={votes}
					label='Child Bounties Value'
					value={formattedTotalRewarded}
					className='border-b border-border_grey pb-4 md:border-b-0 md:border-r md:px-4 md:pb-0 lg:border-r'
				/>
				<StatItem
					icon={delegates}
					label='Curators / Earners'
					value={stats?.peopleEarned}
					className='md:px-4'
				/>
			</div>
		</div>
	);
}

export default BountiesStats;
