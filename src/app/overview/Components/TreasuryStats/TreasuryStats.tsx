// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';
import { Area, AreaChart, XAxis } from 'recharts';
import { type ChartConfig, ChartContainer } from '@ui/chart';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import MythIcon from '@assets/icons/myth.svg';
import { FiChevronRight } from 'react-icons/fi';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ITreasuryStats } from '@/_shared/types';
import Image from 'next/image';

export default function TreasuryStats() {
	const t = useTranslations('Overview');

	const getTreasuryStats = async (): Promise<ITreasuryStats[]> => {
		const to = new Date();
		const from = new Date();
		from.setFullYear(to.getFullYear() - 1);

		const response = await NextApiClientService.getTreasuryStats({ from, to });
		if (Array.isArray(response.data)) {
			return response.data;
		} else {
			return [];
		}
	};

	const {
		data: treasuryStats,
		isLoading,
		error
	} = useQuery({
		queryKey: ['treasuryStats'],
		queryFn: getTreasuryStats
	});

	const chartData = useMemo(() => {
		//  make this dynamic based on the current month
		const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
		const values = [26, 25, 24, 24, 23, 22, 23, 24, 25, 26];

		return months.map((month, index) => ({
			month,
			value: values[index]
		}));
	}, []);

	const chartConfig = {
		value: {
			label: 'Treasury',
			color: 'hsl(var(--chart-1))'
		}
	} satisfies ChartConfig;

	const stats = useMemo(() => {
		if (!treasuryStats || !treasuryStats[0]) return null;

		try {
			const data = treasuryStats[0];

			// Calculate DOT with proper precision
			// DOT has 10 decimal places (planks)
			const totalDot = Number(data?.total?.totalDot || 0) / 10000000000;
			const tokenPrice = Number(data.nativeTokenUsdPrice) || 0;

			// USDC and USDT have 6 decimal places
			const totalUsdc = Number(data?.total?.totalUsdc || 0) / 1_000_000;
			const totalUsdt = Number(data?.total?.totalUsdt || 0) / 1_000_000;

			// MYTH has 18 decimal places
			const totalMyth = Number(data?.total?.totalMyth || 0) / 1e18;

			// Calculate total USD value with higher precision
			const totalUsdValue = Number((totalDot * tokenPrice + totalUsdc + totalUsdt).toFixed(2));

			return {
				dot: totalDot,
				dotFormatted: (totalDot / 1_000_000).toFixed(2),
				usdcFormatted: (totalUsdc / 1_000_000).toFixed(2),
				usdtFormatted: (totalUsdt / 1_000_000).toFixed(2),
				mythFormatted: (totalMyth / 1_000_000).toFixed(2),
				dotPrice: tokenPrice.toFixed(2),
				totalValueUsd: totalUsdValue
			};
		} catch (error) {
			console.error('Error calculating treasury stats:', error);
			return null;
		}
	}, [treasuryStats]);

	if (isLoading) {
		return (
			<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
				<div className='p-3'>
					<p className='text-sm text-wallet_btn_text'>
						{t('treasury')} <MdInfoOutline className='inline-block text-lg' />
					</p>
					<div className='mt-4 flex items-center justify-center'>
						<p className='text-sm text-btn_secondary_text'>Loading treasury stats...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
				<div className='p-3'>
					<p className='text-sm text-wallet_btn_text'>
						{t('treasury')} <MdInfoOutline className='inline-block text-lg' />
					</p>
					<div className='mt-4 flex items-center justify-center'>
						<p className='text-sm text-btn_secondary_text'>{t('comingSoon')}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
			<div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1 text-wallet_btn_text'>
						<p className='text-sm'>Treasury</p>
						<MdInfoOutline className='text-md' />
					</div>
					<div className='flex items-center gap-2'>
						<p className='text-sm text-wallet_btn_text'>DOT Price</p>
						<span className='font-semibold text-btn_secondary_text'>${stats?.dotPrice}</span>
					</div>
				</div>
				<div className='mt-1'>
					<div className='flex items-center gap-2'>
						<span className='text-xl font-bold text-btn_secondary_text'>~${(stats.totalValueUsd / 1_000_000).toFixed(2)}M</span>{' '}
						<span className='flex items-center text-xs text-pink-500'>
							Details <FiChevronRight className='ml-1' />
						</span>
					</div>

					<div className='mt-1 flex gap-3'>
						<div className='flex items-center gap-1'>
							<Image
								src={DotIcon}
								alt='DOT'
								width={16}
								height={16}
							/>
							<span className='text-xs text-btn_secondary_text'>{stats.dotFormatted}M DOT</span>
						</div>
						<div className='flex items-center gap-1'>
							<Image
								src={UsdcIcon}
								alt='USDC'
								width={16}
								height={16}
							/>
							<span className='text-xs text-btn_secondary_text'>{stats.usdcFormatted}M USDC</span>
						</div>
						<div className='flex items-center gap-1'>
							<Image
								src={UsdtIcon}
								alt='USDt'
								width={16}
								height={16}
							/>
							<span className='text-xs text-btn_secondary_text'>{stats.usdtFormatted}M USDt</span>
						</div>
						<div className='flex items-center gap-1'>
							<Image
								src={MythIcon}
								alt='MYTH'
								width={16}
								height={16}
							/>
							<span className='text-xs text-btn_secondary_text'>{stats.mythFormatted}M MYTH</span>
						</div>
					</div>
				</div>

				<div className='mt-4 h-[40px] w-full'>
					<ChartContainer
						config={chartConfig}
						className='h-[40px]'
					>
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{
								top: 0,
								right: 0,
								left: 0,
								bottom: 0
							}}
							height={40}
						>
							<XAxis
								dataKey='month'
								axisLine={false}
								tickLine={false}
								tick={false}
								height={0}
							/>
							<Area
								type='monotone'
								dataKey='value'
								fill='rgba(223, 228, 255, 0.4)'
								fillOpacity={0.4}
								stroke='rgba(175, 184, 239, 0.8)'
								strokeWidth={1.5}
							/>
						</AreaChart>
					</ChartContainer>
				</div>
				<div className='mt-1 flex justify-between px-1 text-xs text-gray-500'>
					{chartData.map((item) => (
						<div key={item.month}>{item.month}</div>
					))}
				</div>
			</div>
		</div>
	);
}
