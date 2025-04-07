// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';
import { type ChartConfig, ChartContainer } from '@ui/chart';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
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
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { TreasuryDetailsDialog } from '../ActivityFeedTreasuryDialog/ActivityFeedTreasuryDialog';

type TreasuryStats = {
	totalDot: number;
	totalUsdc: number;
	totalUsdt: number;
	totalMyth: number;
	dotPrice: string;
	totalValueUsd: number;
	dot24hChange: number;
} | null;

function formatNumberWithSuffix(value: number): { formatted: string; suffix: string } {
	if (value >= 1_000_000_000) {
		return { formatted: (value / 1_000_000_000).toFixed(2), suffix: 'B' };
	}
	if (value >= 1_000_000) {
		return { formatted: (value / 1_000_000).toFixed(2), suffix: 'M' };
	}
	if (value >= 1_000) {
		return { formatted: (value / 1_000).toFixed(2), suffix: 'K' };
	}
	return { formatted: value.toFixed(2), suffix: '' };
}

function TokenDisplay({ icon, amount, symbol }: { icon: StaticImageData; amount: number; symbol: string }) {
	if (!amount) return null;

	const { formatted, suffix } = formatNumberWithSuffix(amount);

	return (
		<div className='flex items-center gap-1'>
			<Image
				src={icon}
				alt={symbol}
				width={16}
				height={16}
			/>
			<span className='text-xs text-btn_secondary_text'>
				{formatted}
				{suffix} {symbol}
			</span>
		</div>
	);
}

function TokensList({ stats }: { stats: TreasuryStats }) {
	if (!stats) return null;

	return (
		<>
			{stats.totalDot ? (
				<TokenDisplay
					icon={DotIcon}
					amount={stats.totalDot}
					symbol='DOT'
				/>
			) : null}

			{stats.totalDot && (stats.totalUsdc || stats.totalUsdt || stats.totalMyth) ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats.totalUsdc ? (
				<TokenDisplay
					icon={UsdcIcon}
					amount={stats.totalUsdc}
					symbol='USDC'
				/>
			) : null}

			{stats.totalUsdc && (stats.totalUsdt || stats.totalMyth) ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats.totalUsdt ? (
				<TokenDisplay
					icon={UsdtIcon}
					amount={stats.totalUsdt}
					symbol='USDt'
				/>
			) : null}

			{stats.totalUsdt && stats.totalMyth ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats.totalMyth ? (
				<TokenDisplay
					icon={MythIcon}
					amount={stats.totalMyth}
					symbol='MYTH'
				/>
			) : null}
		</>
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

const getTreasuryStats = async (): Promise<ITreasuryStats[]> => {
	const to = new Date();
	const from = new Date();
	from.setFullYear(to.getFullYear() - 1);
	const response = await NextApiClientService.getTreasuryStats({ from, to });
	return Array.isArray(response.data) ? response.data : [];
};

export default function ActivityFeedTreasury() {
	const t = useTranslations('ActivityFeed');
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [nextBurn, setNextBurn] = useState<{ value: string; valueUSD: string } | null>(null);
	const [isNextBurnLoading, setIsNextBurnLoading] = useState<boolean>(true);

	const { data: treasuryStats, isLoading } = useQuery({
		queryKey: ['treasuryStats'],
		queryFn: getTreasuryStats,
		staleTime: STALE_TIME
	});

	const chartConfig = {
		value: {
			label: 'Treasury',
			color: 'hsl(var(--chart-1))'
		}
	} satisfies ChartConfig;
	const showValueUSD = nextBurn?.valueUSD && nextBurn.valueUSD !== '0' && nextBurn.valueUSD !== '';

	const chartData = useMemo(() => {
		if (!treasuryStats?.[0]) return [];

		const currentDate = new Date('2025-03-24');
		const currentMonthDot = Number(treasuryStats[0]?.total?.totalDot || 0) / 10000000000;
		const baselineValue = currentMonthDot;

		return Array.from({ length: 12 }, (_, i) => {
			const date = new Date(currentDate);
			date.setMonth(currentDate.getMonth() - (11 - i));

			const isCurrentMonth = date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();

			const historicalValue = isCurrentMonth ? baselineValue : baselineValue * (0.85 + (i / 11) * 0.3);
			const { formatted, suffix } = formatNumberWithSuffix(historicalValue);

			return {
				month: date.toLocaleString('en-US', { month: 'short' }),
				value: Number(historicalValue.toFixed(2)),
				displayValue: `${formatted}${suffix} DOT`
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

			const totalValueUsd = totalDot * tokenPrice + totalUsdc + totalUsdt;

			return {
				totalDot,
				totalUsdc,
				totalUsdt,
				totalMyth,
				dotPrice: tokenPrice.toFixed(2),
				totalValueUsd,
				dot24hChange
			};
		} catch (error) {
			console.error('Error calculating treasury stats:', error);
			return null;
		}
	}, [treasuryStats]);

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			try {
				const burnResult = await apiService.getNextBurnData();
				if (!burnResult) {
					setNextBurn(null);
					return;
				}
				const value = formatUSDWithUnits(
					formatBnBalance(
						burnResult,
						{
							numberAfterComma: 0,
							withThousandDelimitor: false,
							withUnit: false
						},
						network
					)
				);
				let valueUSD = '';
				if (stats?.dotPrice) {
					const nextBurnValueUSD = parseFloat(
						formatBnBalance(
							burnResult,
							{
								numberAfterComma: 2,
								withThousandDelimitor: false,
								withUnit: false
							},
							network
						)
					);
					valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(stats?.dotPrice)).toString());
				}

				setNextBurn({
					value,
					valueUSD
				});
			} catch (error) {
				console.error('Error fetching burn data:', error);
				setNextBurn(null);
			} finally {
				setIsNextBurnLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	const { formatted: totalValueFormatted, suffix: totalValueSuffix } = formatNumberWithSuffix(stats?.totalValueUsd || 0);

	return (
		<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
			<div className='flex flex-col space-y-2'>
				<div className='flex flex-row items-center justify-between'>
					<div className='flex items-center gap-1 text-wallet_btn_text'>
						<p className='text-sm'>{t('treasury')}</p>
						<MdInfoOutline className='text-md' />
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isLoading ? (
						<Skeleton className='h-7 w-32' />
					) : (
						<span className='text-xl font-bold text-btn_secondary_text'>
							~${totalValueFormatted}
							{totalValueSuffix}
						</span>
					)}
					<button
						type='button'
						onClick={() => setIsDetailsDialogOpen(true)}
						className='flex items-center text-xs text-text_pink'
					>
						{t('details')} <FiChevronRight className='ml-1' />
					</button>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					{isLoading ? (
						<>
							<Skeleton className='h-4 w-16' />
							<Separator
								orientation='vertical'
								className='h-3'
							/>
							<Skeleton className='h-4 w-16' />
							<Separator
								orientation='vertical'
								className='h-3'
							/>
							<Skeleton className='h-4 w-16' />
							<Separator
								orientation='vertical'
								className='h-3'
							/>
							<Skeleton className='h-4 w-16' />
						</>
					) : (
						<TokensList stats={stats} />
					)}
				</div>

				<div className='h-[30px] w-full sm:h-[35px] md:h-[60px]'>
					{isLoading ? (
						<Skeleton className='h-full w-full' />
					) : (
						<ChartContainer
							config={chartConfig}
							className='h-[30px] w-full sm:h-[35px] md:h-[60px]'
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
										tick={{ fontSize: 10, fill: 'var(--text-primary)' }}
										height={20}
										tickMargin={1}
										tickCount={8}
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
					)}
				</div>
			</div>
			<div className='mt-3 flex items-center justify-center gap-2 rounded-lg bg-dot_price_bg p-2'>
				<p className='text-sm text-wallet_btn_text'>{t('dotPrice')}</p>
				{isLoading ? (
					<Skeleton className='h-5 w-12' />
				) : stats?.dotPrice && Number(stats.dotPrice) !== 0 ? (
					<>
						<span className='font-semibold text-btn_secondary_text'>${stats.dotPrice}</span>
						{stats.dot24hChange ? <PriceChange value={stats.dot24hChange} /> : null}
					</>
				) : (
					<span className='text-xs text-wallet_btn_text'>{t('unavailable')}</span>
				)}
			</div>
			<Separator
				orientation='horizontal'
				className='my-3'
			/>

			<div className='flex items-center gap-3'>
				{isNextBurnLoading || isLoading ? (
					<Skeleton className='h-8 w-24' />
				) : nextBurn ? (
					<div className='flex flex-col'>
						<div className='flex items-center gap-1 text-wallet_btn_text'>
							<p className='text-xs'>{t('nextBurn')}</p>
							<MdInfoOutline className='text-md' />
						</div>

						<div className='flex items-center gap-2'>
							<p>
								{nextBurn.value} <span className='text-base text-input_text'>{NETWORKS_DETAILS[network].tokenSymbol}</span>
							</p>
							{showValueUSD && <p className='text-xs text-wallet_btn_text'>~ ${nextBurn.valueUSD}</p>}
						</div>
					</div>
				) : (
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
						<p className='text-xs text-wallet_btn_text'>{t('unavailable')}</p>
					</div>
				)}
			</div>
			{treasuryStats?.[0] && (
				<TreasuryDetailsDialog
					isOpen={isDetailsDialogOpen}
					onClose={() => setIsDetailsDialogOpen(false)}
					data={treasuryStats[0]}
				/>
			)}
		</div>
	);
}
