// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { type ChartConfig } from '@ui/Chart';
import { useTranslations, useFormatter } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { FiChevronRight } from 'react-icons/fi';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ITreasuryStats } from '@/_shared/types';
import { Separator } from '@/app/_shared-components/Separator';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { TreasuryDetailsDialog } from '../ActivityFeedTreasuryDialog/ActivityFeedTreasuryDialog';
import TreasuryChart from './Components/TreasuryChart';
import NextBurnDisplay from './Components/NextBurnDisplay';
import TreasuryTokensDisplay from './Components/TreasuryTokensDisplay';

function PriceChange({ value }: { value: number }) {
	const isPositive = value > 0;
	return (
		<span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-failure'}`}>
			{value.toFixed(2)}% {isPositive ? <FaCaretUp /> : <FaCaretDown />}
		</span>
	);
}

const getTreasuryStats = async (): Promise<ITreasuryStats[]> => {
	const to = new Date();
	const from = new Date();
	from.setFullYear(to.getFullYear() - 1);
	const response = await NextApiClientService.getTreasuryStats({ from, to });
	return Array.isArray(response.data) ? response.data : [];
};

function TreasuryValueDisplay({
	isLoading,
	treasuryError,
	showTotalValue,
	totalValueFormatted,
	totalValueSuffix,
	hasData,
	onDetailsClick
}: {
	isLoading: boolean;
	treasuryError: unknown;
	showTotalValue: boolean;
	totalValueFormatted: string;
	totalValueSuffix: string;
	hasData: boolean;
	onDetailsClick: () => void;
}) {
	const t = useTranslations('ActivityFeed');

	return (
		<div className='flex items-center gap-2'>
			{isLoading ? (
				<Skeleton className='h-7 w-32' />
			) : treasuryError ? (
				<span className='text-sm text-failure'>{t('dataUnavailable')}</span>
			) : showTotalValue ? (
				<span className='text-xl font-bold text-btn_secondary_text'>
					~${totalValueFormatted}
					{totalValueSuffix}
				</span>
			) : (
				<span className='text-sm text-wallet_btn_text'>{t('unavailable')}</span>
			)}
			{hasData && (
				<button
					type='button'
					onClick={onDetailsClick}
					className='flex items-center text-xs text-text_pink'
				>
					{t('details')} <FiChevronRight className='ml-1' />
				</button>
			)}
		</div>
	);
}

function DotPriceDisplay({
	isLoading,
	treasuryError,
	stats
}: {
	isLoading: boolean;
	treasuryError: unknown;
	stats: {
		totalDot: number;
		totalUsdc: number;
		totalUsdt: number;
		totalMyth: number;
		dotPrice: string;
		totalValueUsd: number;
		dot24hChange: number;
	} | null;
}) {
	const t = useTranslations('ActivityFeed');

	if (isLoading) {
		return <Skeleton className='h-5 w-12' />;
	}

	if (treasuryError) {
		return <span className='text-xs text-failure'>{t('dataUnavailable')}</span>;
	}

	if (stats?.dotPrice && Number(stats.dotPrice) !== 0) {
		return (
			<>
				<span className='font-semibold text-btn_secondary_text'>${stats.dotPrice}</span>
				{stats.dot24hChange ? <PriceChange value={stats.dot24hChange} /> : null}
			</>
		);
	}

	return <span className='text-xs text-wallet_btn_text'>{t('unavailable')}</span>;
}

export default function ActivityFeedTreasury() {
	const t = useTranslations('ActivityFeed');
	const format = useFormatter();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [nextBurn, setNextBurn] = useState<{ value: string; valueUSD: string } | null>(null);
	const [isNextBurnLoading, setIsNextBurnLoading] = useState<boolean>(true);
	const [nextBurnError, setNextBurnError] = useState<boolean>(false);

	const {
		data: treasuryStats,
		isLoading,
		error: treasuryError
	} = useQuery({
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
	const showValueUSD = Boolean(nextBurn?.valueUSD && nextBurn.valueUSD !== '0' && nextBurn.valueUSD !== '');

	const chartData = useMemo(() => {
		if (!treasuryStats?.length) return [];

		const sortedStats = [...treasuryStats].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

		return sortedStats.map((stat) => {
			const date = new Date(stat.createdAt);
			const totalDot = Number(stat.total?.totalDot || 0) / 10000000000;

			return {
				month: date.toLocaleString('en-US', { month: 'short' }),
				value: Number(totalDot.toFixed(2)),
				displayValue: `${format.number(totalDot, {
					notation: 'compact',
					maximumFractionDigits: 2
				})} DOT`
			};
		});
	}, [treasuryStats, format]);

	const stats = useMemo(() => {
		if (!treasuryStats?.[0]) return null;

		try {
			const data = treasuryStats[0];
			const totalDot = Number(data?.total?.totalDot) / 10000000000;
			const tokenPrice = Number(data.nativeTokenUsdPrice);
			const dot24hChange = Number(data?.nativeTokenUsdPrice24hChange);
			const totalUsdc = Number(data?.total?.totalUsdc) / 1_000_000;
			const totalUsdt = Number(data?.total?.totalUsdt) / 1_000_000;
			const totalMyth = Number(data?.total?.totalMyth) / 1e18;

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
					setNextBurnError(true);
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
				setNextBurnError(false);
			} catch (error) {
				console.error('Error fetching burn data:', error);
				setNextBurn(null);
				setNextBurnError(true);
			} finally {
				setIsNextBurnLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	const { totalValueFormatted, totalValueSuffix } = useMemo(() => {
		const value = stats?.totalValueUsd || 0;
		return {
			totalValueFormatted: format.number(value, {
				notation: 'compact',
				maximumFractionDigits: 2
			}),
			totalValueSuffix: ''
		};
	}, [stats?.totalValueUsd, format]);

	const hasData = !!stats && !treasuryError;
	const showTotalValue = hasData && !!stats?.totalValueUsd && stats.totalValueUsd > 0;

	return (
		<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
			<div className='flex flex-col space-y-2'>
				<div className='flex flex-row items-center justify-between'>
					<div className='flex items-center gap-1 text-wallet_btn_text'>
						<p className='text-sm'>{t('treasury')}</p>
						<MdInfoOutline className='text-md' />
					</div>
				</div>

				<TreasuryValueDisplay
					isLoading={isLoading}
					treasuryError={treasuryError}
					showTotalValue={showTotalValue}
					totalValueFormatted={totalValueFormatted}
					totalValueSuffix={totalValueSuffix}
					hasData={hasData}
					onDetailsClick={() => setIsDetailsDialogOpen(true)}
				/>

				<div className='flex flex-wrap items-center gap-2'>
					<TreasuryTokensDisplay
						isLoading={isLoading}
						treasuryError={treasuryError}
						stats={stats}
					/>
				</div>

				<div className='h-[30px] w-full sm:h-[35px] md:h-[60px]'>
					<TreasuryChart
						isLoading={isLoading}
						treasuryError={treasuryError}
						chartData={chartData}
						chartConfig={chartConfig}
					/>
				</div>
			</div>
			<div className='mt-3 flex items-center justify-center gap-2 rounded-lg bg-dot_price_bg p-2'>
				<p className='text-sm text-wallet_btn_text'>{t('dotPrice')}</p>
				<DotPriceDisplay
					isLoading={isLoading}
					treasuryError={treasuryError}
					stats={stats}
				/>
			</div>
			<Separator
				orientation='horizontal'
				className='my-3'
			/>

			<div className='flex items-center gap-3'>
				<NextBurnDisplay
					isNextBurnLoading={isNextBurnLoading}
					nextBurnError={nextBurnError}
					nextBurn={nextBurn}
					showValueUSD={showValueUSD}
					network={network}
				/>
			</div>
			{treasuryStats?.[0] && !treasuryError && (
				<TreasuryDetailsDialog
					isOpen={isDetailsDialogOpen}
					onClose={() => setIsDetailsDialogOpen(false)}
					data={treasuryStats[0]}
				/>
			)}
		</div>
	);
}
