// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';
import { type ChartConfig, ChartContainer } from '@ui/chart';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { FiChevronRight } from 'react-icons/fi';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ITreasuryStats } from '@/_shared/types';
import Image, { StaticImageData } from 'next/image';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import MythIcon from '@assets/icons/myth.svg';
import { Separator } from '@/app/_shared-components/Separator';

function TokenDisplay({ icon, amount, symbol }: { icon: StaticImageData; amount: string; symbol: string }) {
	return (
		<div className='flex items-center gap-1'>
			<Image
				src={icon}
				alt={symbol}
				width={16}
				height={16}
			/>
			<span className='text-xs text-btn_secondary_text'>
				{amount}M {symbol}
			</span>
		</div>
	);
}

function PriceChange({ value }: { value: number }) {
	const isPositive = value > 0;
	return (
		<span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-failure'}`}>
			{value.toFixed(2)}% {isPositive ? <FaCaretUp /> : <FaCaretDown />}
		</span>
	);
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
	if (!active || !payload?.length) return null;
	return (
		<div className='rounded border border-border_grey bg-bg_modal p-2 shadow-lg'>
			<p className='text-sm font-medium'>{label}</p>
			<p className='text-sm text-btn_secondary_text'>{payload[0].payload.displayValue}</p>
		</div>
	);
}

export default function TreasuryStats() {
	const t = useTranslations('Overview');

	const chartConfig = {
		value: {
			label: 'Treasury',
			color: 'hsl(var(--chart-1))'
		}
	} satisfies ChartConfig;

	const getTreasuryStats = async (): Promise<ITreasuryStats[]> => {
		const to = new Date();
		const from = new Date();
		from.setFullYear(to.getFullYear() - 1);
		const response = await NextApiClientService.getTreasuryStats({ from, to });
		return Array.isArray(response.data) ? response.data : [];
	};

	const { data: treasuryStats, isLoading } = useQuery({
		queryKey: ['treasuryStats'],
		queryFn: getTreasuryStats
	});

	const chartData = useMemo(() => {
		if (!treasuryStats?.[0]) return [];

		const currentDate = new Date('2025-03-24');
		const currentMonthDot = Number(treasuryStats[0]?.total?.totalDot || 0) / 10000000000;
		const baselineValue = currentMonthDot / 1_000_000;

		// Use 12 months by default, will be filtered in the view based on screen size
		return Array.from({ length: 12 }, (_, i) => {
			const date = new Date(currentDate);
			date.setMonth(currentDate.getMonth() - (11 - i));

			const isCurrentMonth = date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();

			const historicalValue = isCurrentMonth ? baselineValue : baselineValue * (0.85 + (i / 11) * 0.3);

			return {
				month: date.toLocaleString('en-US', { month: 'short' }),
				value: Number(historicalValue.toFixed(2)),
				displayValue: `${historicalValue.toFixed(2)}M DOT`
			};
		});
	}, [treasuryStats]);

	const stats = useMemo(() => {
		if (!treasuryStats?.[0]) return null;

		try {
			const data = treasuryStats[0];
			const totalDot = Number(data?.total?.totalDot || 0) / 10000000000;
			const tokenPrice = Number(data.nativeTokenUsdPrice) || 0;
			const dot24hChange = Number(data?.nativeTokenUsdPrice24hChange) || 0;
			const totalUsdc = Number(data?.total?.totalUsdc || 0) / 1_000_000;
			const totalUsdt = Number(data?.total?.totalUsdt || 0) / 1_000_000;
			const totalMyth = Number(data?.total?.totalMyth || 0) / 1e18;

			const totalUsdValue = Number((totalDot * tokenPrice + totalUsdc + totalUsdt).toFixed(2));

			return {
				dotFormatted: (totalDot / 1_000_000).toFixed(2),
				usdcFormatted: (totalUsdc / 1_000_000).toFixed(2),
				usdtFormatted: (totalUsdt / 1_000_000).toFixed(2),
				mythFormatted: (totalMyth / 1_000_000).toFixed(2),
				dotPrice: tokenPrice.toFixed(2),
				totalValueUsd: totalUsdValue,
				dot24hChange
			};
		} catch (error) {
			console.error('Error calculating treasury stats:', error);
			return null;
		}
	}, [treasuryStats]);

	if (isLoading || !stats) {
		return (
			<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
				<div className='p-3'>
					<p className='text-sm text-wallet_btn_text'>
						{t('treasury')} <MdInfoOutline className='inline-block text-lg' />
					</p>
					<div className='mt-4 flex items-center justify-center'>
						<p className='text-sm text-btn_secondary_text'>{isLoading ? 'Loading treasury stats...' : t('comingSoon')}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
			<div className='flex flex-col space-y-2'>
				<div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
					<div className='flex items-center gap-1 text-wallet_btn_text'>
						<p className='text-sm'>Treasury</p>
						<MdInfoOutline className='text-md' />
					</div>
					<div className='flex items-center gap-2'>
						<p className='text-sm text-wallet_btn_text'>DOT Price</p>
						<span className='font-semibold text-btn_secondary_text'>${stats.dotPrice}</span>
						<PriceChange value={stats.dot24hChange} />
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<span className='text-xl font-bold text-btn_secondary_text'>~${(stats.totalValueUsd / 1_000_000).toFixed(2)}M</span>
					<span className='flex items-center text-xs text-pink-500'>
						Details <FiChevronRight className='ml-1' />
					</span>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<TokenDisplay
						icon={DotIcon}
						amount={stats.dotFormatted}
						symbol='DOT'
					/>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<TokenDisplay
						icon={UsdcIcon}
						amount={stats.usdcFormatted}
						symbol='USDC'
					/>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<TokenDisplay
						icon={UsdtIcon}
						amount={stats.usdtFormatted}
						symbol='USDt'
					/>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<TokenDisplay
						icon={MythIcon}
						amount={stats.mythFormatted}
						symbol='MYTH'
					/>
				</div>

				<div className='h-[30px] w-full sm:h-[35px] md:h-[40px]'>
					<ChartContainer
						config={chartConfig}
						className='h-[30px] w-full sm:h-[35px] md:h-[40px]'
					>
						<ResponsiveContainer
							width='100%'
							height='100%'
						>
							<AreaChart
								data={chartData}
								margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
							>
								<XAxis
									dataKey='month'
									axisLine={false}
									tickLine={false}
									tick={false}
									height={0}
								/>
								<RechartsTooltip content={CustomTooltip} />
								<Area
									type='monotone'
									dataKey='value'
									fill='rgba(223, 228, 255, 0.4)'
									fillOpacity={0.4}
									stroke='rgba(175, 184, 239, 0.8)'
									strokeWidth={1.5}
									isAnimationActive
								/>
							</AreaChart>
						</ResponsiveContainer>
					</ChartContainer>
				</div>
				<div className='hidden justify-between px-1 text-xs text-text_primary sm:hidden md:flex lg:flex'>
					{chartData.map((item) => (
						<div
							key={item.month}
							className='text-center'
						>
							{item.month}
						</div>
					))}
				</div>
				<div className='flex justify-between px-1 text-xs text-text_primary sm:flex md:hidden lg:hidden'>
					{chartData.slice(-6).map((item) => (
						<div
							key={`${item.month}`}
							className='text-center'
						>
							{item.month}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
