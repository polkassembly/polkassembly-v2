// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EAssets, IErrorResponse, ITreasuryStats } from '@/_shared/types';
import { Info } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './TreasuryStats.module.scss';
import { TooltipContent, TooltipTrigger, Tooltip } from '../Tooltip';
import { Separator } from '../Separator';
import { Button } from '../Button';
import { TreasuryDetailsDialog } from './TreasuryStatsDialog';
import { Skeleton } from '../Skeleton';
import SpendPeriodStats from './SpendPeriodStats';
import ErrorMessage from '../ErrorMessage';

interface PriceDisplayProps {
	tokenSymbol: string;
	price: string;
	priceChange: string;
	priceChangeColor: string;
}

function PriceDisplay({ tokenSymbol, price, priceChange, priceChangeColor }: PriceDisplayProps) {
	const t = useTranslations();
	return (
		<div className='flex items-center gap-2'>
			<div className='flex items-center'>
				<span className='mr-2 flex text-sm font-medium capitalize text-muted-foreground'>
					{tokenSymbol} {t('TreasuryStats.price')}:
				</span>
				<span className={cn('text-base font-bold text-muted-foreground dark:text-white', priceChangeColor)}>${price}</span>
			</div>
			<span className={cn('mt-0.5 flex items-center gap-1 text-sm', priceChangeColor)}>
				{priceChange} {priceChange.startsWith('+') ? '▲' : '▼'}
			</span>
		</div>
	);
}

interface AssetDisplayProps {
	icon: string | StaticImageData;
	alt: string;
	value: string;
	showSeparator?: boolean;
	inActivityFeed?: boolean;
}
function AssetDisplay({ icon, alt, value, showSeparator = true, inActivityFeed = false }: AssetDisplayProps) {
	return (
		<>
			<div className='flex items-center font-medium'>
				<Image
					src={icon}
					alt={alt}
					width={inActivityFeed ? 16 : 20}
					height={inActivityFeed ? 16 : 20}
					className='mr-2 rounded-full'
				/>
				<span className='font-medium'>{value}</span>
			</div>
			{showSeparator && (
				<Separator
					orientation='vertical'
					className='hidden h-3 lg:block'
				/>
			)}
		</>
	);
}

interface TreasuryHeaderProps {
	isActivityFeed: boolean;
	tokenSymbol: string;
	priceData: {
		price: string;
		priceChange: string;
		priceChangeColor: string;
	};
	onDetailsClick: () => void;
}

function TreasuryHeader({ isActivityFeed, tokenSymbol, priceData, onDetailsClick }: TreasuryHeaderProps) {
	const t = useTranslations();
	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-1'>
				<h2 className={cn('text-muted-foreground', isActivityFeed ? 'text-lg font-bold' : 'text-sm font-normal')}>{t('TreasuryStats.treasury')}</h2>
				<Tooltip>
					<TooltipTrigger asChild>
						<Info className='text-text-grey h-4 w-4' />
					</TooltipTrigger>
					<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-white'>
						<p>{t('TreasuryStats.tooltip')}</p>
					</TooltipContent>
				</Tooltip>
			</div>
			{!isActivityFeed ? (
				<div className='mt-2 flex items-center justify-between text-xs'>
					<PriceDisplay
						tokenSymbol={tokenSymbol}
						price={priceData.price}
						priceChange={priceData.priceChange}
						priceChangeColor={priceData.priceChangeColor}
					/>
				</div>
			) : (
				<Button
					variant='link'
					size='sm'
					onClick={onDetailsClick}
					className='border-none p-0 text-xs font-medium text-text_pink'
				>
					{t('TreasuryStats.details')}
				</Button>
			)}
		</div>
	);
}

const useTreasuryData = (data: ITreasuryStats[]) => {
	const network = getCurrentNetwork();

	const formatAssetBalance = (value: string | BN, assetSymbol?: EAssets) => {
		const assetIndex = assetSymbol
			? Object.values(NETWORKS_DETAILS[`${network}`]?.supportedAssets)?.find((supportedAsset) => supportedAsset.symbol === assetSymbol)?.index
			: undefined;

		return formatBnBalance(value || BN_ZERO?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network, assetIndex);
	};

	const formatMythBalance = (value: string) => {
		return formatUSDWithUnits(new BN(value || BN_ZERO?.toString())?.div(new BN(10).pow(new BN(treasuryAssetsData[EAssets.MYTH]?.tokenDecimal)))?.toString(), 2);
	};

	return {
		totalInUsd: formatUSDWithUnits(data?.[0]?.total?.totalInUsd || BN_ZERO?.toString(), 2),
		dotBalance: formatAssetBalance(data?.[0]?.total?.totalDot || BN_ZERO),
		usdcBalance: formatAssetBalance(data?.[0]?.total?.totalUsdc || BN_ZERO?.toString(), EAssets.USDC),
		usdtBalance: formatAssetBalance(data?.[0]?.total?.totalUsdt || BN_ZERO?.toString(), EAssets.USDT),
		mythBalance: formatMythBalance(data?.[0]?.total?.totalMyth || BN_ZERO?.toString())
	};
};

function TreasuryStats({ isActivityFeed = false, data, error }: { isActivityFeed?: boolean; data: ITreasuryStats[]; error: IErrorResponse | null }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const tokenSymbol = NETWORKS_DETAILS?.[`${network}`]?.tokenSymbol;
	const [isOpen, setIsOpen] = useState(false);

	const priceChange = data?.[0]?.nativeTokenUsdPrice24hChange;
	const isPriceUp = priceChange && parseFloat(priceChange) >= 0;
	const priceChangeText = isPriceUp ? `+${Number(priceChange).toFixed(2)}%` : `${Number(priceChange).toFixed(2)}%`;
	const priceChangeColor = isPriceUp ? 'text-success' : 'text-destructive';

	const treasuryData = useTreasuryData(data);

	if (error || !data?.length) {
		return <ErrorMessage errorMessage={error?.message || t('TreasuryStats.error')} />;
	}
	if (!data?.length && !error) {
		return <Skeleton className='h-full w-full' />;
	}

	return (
		<div className='flex w-full gap-x-4 max-md:flex-col'>
			<div className={cn(styles.treasuryStatsContainer, !isActivityFeed ? 'w-1/2 max-md:w-full' : 'w-full')}>
				<TreasuryHeader
					isActivityFeed={isActivityFeed}
					tokenSymbol={tokenSymbol}
					priceData={{
						price: formatUSDWithUnits(data?.[0]?.nativeTokenUsdPrice || BN_ZERO?.toString(), 2),
						priceChange: priceChangeText,
						priceChangeColor
					}}
					onDetailsClick={() => setIsOpen(true)}
				/>

				<div className='mt-2'>
					<h1 className='text-lg font-bold text-muted-foreground dark:text-white'>~${treasuryData.totalInUsd}</h1>

					<div className={cn('mt-2 flex flex-wrap items-center gap-2 font-semibold', isActivityFeed ? 'text-xs' : 'text-sm')}>
						<div className={cn('flex items-center max-md:gap-x-2', isActivityFeed ? 'gap-x-1' : 'gap-x-6')}>
							<AssetDisplay
								icon={NETWORKS_DETAILS[`${network}`].logo}
								alt={network}
								value={treasuryData.dotBalance}
								inActivityFeed={isActivityFeed}
							/>
							<AssetDisplay
								icon={treasuryAssetsData[EAssets.USDC]?.icon}
								alt={EAssets.USDC}
								value={treasuryData.usdcBalance}
								showSeparator={false}
								inActivityFeed={isActivityFeed}
							/>
						</div>
						<div className={cn('flex items-center max-md:gap-2', isActivityFeed ? 'gap-2' : 'gap-6')}>
							<AssetDisplay
								icon={treasuryAssetsData[EAssets.USDT]?.icon}
								alt={EAssets.USDT}
								value={treasuryData.usdtBalance}
								inActivityFeed={isActivityFeed}
							/>
							<AssetDisplay
								icon={treasuryAssetsData[EAssets.MYTH]?.icon}
								alt={EAssets.MYTH}
								value={`${treasuryData.mythBalance} ${treasuryAssetsData[EAssets.MYTH]?.symbol}`}
								showSeparator={false}
								inActivityFeed={isActivityFeed}
							/>
						</div>
					</div>
					{!isActivityFeed && (
						<Button
							variant='link'
							size='sm'
							onClick={() => setIsOpen(true)}
							className='border-none p-0 text-sm font-medium text-text_pink underline'
						>
							{t('TreasuryStats.viewDetails')}
						</Button>
					)}
				</div>

				{isActivityFeed && (
					<div className='mt-4 flex items-center justify-center rounded-md bg-bg_code py-2 text-xs shadow-sm'>
						<PriceDisplay
							tokenSymbol={tokenSymbol}
							price={formatUSDWithUnits(data?.[0]?.nativeTokenUsdPrice || BN_ZERO?.toString(), 2)}
							priceChange={priceChangeText}
							priceChangeColor={priceChangeColor}
						/>
					</div>
				)}

				<TreasuryDetailsDialog
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					data={data?.[0] || null}
				/>
			</div>

			{!isActivityFeed && (
				<div className='w-1/2 max-md:w-full'>
					<SpendPeriodStats
						nextSpendAt={data?.[0]?.relayChain?.nextSpendAt}
						nextBurn={data?.[0]?.relayChain?.nextBurn}
					/>
				</div>
			)}
		</div>
	);
}

export default TreasuryStats;
