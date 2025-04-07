// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations } from 'next-intl';
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';
import { type ChartConfig, ChartContainer } from '@ui/chart';

interface ChartDataItem {
	month: string;
	value: number;
	displayValue: string;
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

function TreasuryChart({ isLoading, treasuryError, chartData, chartConfig }: { isLoading: boolean; treasuryError: unknown; chartData: ChartDataItem[]; chartConfig: ChartConfig }) {
	const t = useTranslations('ActivityFeed');

	if (isLoading) {
		return <Skeleton className='h-full w-full' />;
	}

	if (treasuryError) {
		return (
			<div className='flex h-full w-full items-center justify-center'>
				<span className='text-xs text-failure'>{t('chartUnavailable')}</span>
			</div>
		);
	}

	if (chartData.length === 0) {
		return (
			<div className='flex h-full w-full items-center justify-center'>
				<span className='text-xs text-wallet_btn_text'>{t('noChartData')}</span>
			</div>
		);
	}

	return (
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
	);
}

export default TreasuryChart;
