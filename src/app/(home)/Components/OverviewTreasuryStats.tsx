// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EAssets, ENetwork, ITreasuryStats } from '@/_shared/types';
import { ExternalLink } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TooltipContent, TooltipTrigger, Tooltip } from '@/app/_shared-components/Tooltip';
import { TreasuryDetailsDialog } from '@/app/_shared-components/TreasuryStats/TreasuryStatsDialog';
import { Button } from '@/app/_shared-components/Button';
import { AiFillQuestionCircle } from '@react-icons/all-files/ai/AiFillQuestionCircle';

interface AssetDisplayProps {
	icon: string | StaticImageData;
	value: string;
	symbol?: string;
}

function AssetDisplay({ icon, value, symbol }: AssetDisplayProps) {
	const getAssetColor = (assetSymbol?: string) => {
		switch (assetSymbol) {
			case EAssets.USDC:
				return '#F380BC';
			case EAssets.USDT:
				return '#F7B2D7';
			case EAssets.MYTH:
				return '#FCE5F2';
			case 'DOT':
				return '#E6007A';
			case 'KSM':
				return '#000000';
			default:
				return '#E6007A';
		}
	};

	return (
		<div className='flex items-center gap-1 rounded-full border border-treasury_token_symbol_border px-2 py-1 text-xs font-medium text-text_primary shadow-sm'>
			<div
				className='h-3 w-3'
				style={{ backgroundColor: getAssetColor(symbol) }}
			/>
			<span>{value}</span>
			{symbol && <span className='uppercase'>{symbol}</span>}
			<Image
				src={icon}
				alt='asset logo'
				width={16}
				height={16}
				className='rounded-full'
			/>
		</div>
	);
}

const useTreasuryData = (data: ITreasuryStats[]) => {
	const network = getCurrentNetwork();
	const tokenSymbol = NETWORKS_DETAILS[`${network}`]?.tokenSymbol;

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
		nativeTokenBalance: formatAssetBalance(data?.[0]?.total?.totalNativeToken || BN_ZERO)
			.replace(tokenSymbol, '')
			.trim(),
		usdcBalance: formatAssetBalance(data?.[0]?.total?.totalUsdc || BN_ZERO?.toString(), EAssets.USDC)
			.replace(/USDC/i, '')
			.trim(),
		usdtBalance: formatAssetBalance(data?.[0]?.total?.totalUsdt || BN_ZERO?.toString(), EAssets.USDT)
			.replace(/USDt|USDT/i, '')
			.trim(),
		mythBalance: formatMythBalance(data?.[0]?.total?.totalMyth || BN_ZERO?.toString())
			.replace(/MYTH/i, '')
			.trim()
	};
};

function OverviewTreasuryStats({ data }: { data: ITreasuryStats[] }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const tokenSymbol = NETWORKS_DETAILS?.[`${network}`]?.tokenSymbol;
	const [isOpen, setIsOpen] = useState(false);

	const priceChange = data?.[0]?.nativeTokenUsdPrice24hChange;
	const parsedPriceChange = priceChange ? parseFloat(priceChange) : 0;
	const isPriceUp = parsedPriceChange >= 0;
	const priceChangeText = `${parsedPriceChange.toFixed(2)}%`;
	const treasuryData = useTreasuryData(data || []);

	if (!data || !data?.length) {
		return null;
	}

	return (
		<div className='flex h-full w-full flex-col justify-between'>
			<div className='flex flex-wrap items-center justify-between gap-y-2'>
				<div className='flex flex-wrap items-baseline gap-x-2'>
					<div className='flex items-center gap-1'>
						<h2 className='text-xl font-bold text-text_primary'>{t('TreasuryStats.treasury')}</h2>
						<Tooltip>
							<TooltipTrigger asChild>
								<AiFillQuestionCircle className='h-4 w-4 text-question_icon_color' />
							</TooltipTrigger>
							<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-white'>
								<p>{t('TreasuryStats.tooltip')}</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<span className='text-xl font-bold text-text_pink'>≈ ${treasuryData.totalInUsd}</span>

					<div className='flex items-center gap-1 rounded-md border border-treasury_token_symbol_border px-2 py-1 text-xs shadow-sm'>
						<span className='text-wallet_btn_text'>
							{tokenSymbol} {t('TreasuryStats.price')}
						</span>
						<span className='text-[16px] font-semibold text-wallet_btn_text'>${formatUSDWithUnits(data?.[0]?.nativeTokenUsdPrice || BN_ZERO?.toString(), 2)}</span>
						<span className={cn('font-medium', isPriceUp ? 'text-success' : 'text-failure')}>
							{priceChangeText} {isPriceUp ? '▲' : '▼'}
						</span>
					</div>
				</div>

				<Button
					variant='link'
					onClick={() => setIsOpen(true)}
					className='flex items-center gap-1 p-0 text-sm font-medium text-text_pink hover:no-underline'
				>
					{t('Overview.viewAll')} <ExternalLink className='h-3 w-3' />
				</Button>
			</div>

			<div className='mt-4 flex flex-wrap gap-2'>
				<AssetDisplay
					icon={NETWORKS_DETAILS[`${network}`]?.logo}
					value={treasuryData.nativeTokenBalance}
					symbol={tokenSymbol}
				/>

				{network === ENetwork.POLKADOT && (
					<>
						<AssetDisplay
							icon={treasuryAssetsData[EAssets.USDC]?.icon}
							value={treasuryData.usdcBalance}
							symbol={EAssets.USDC}
						/>
						<AssetDisplay
							icon={treasuryAssetsData[EAssets.USDT]?.icon}
							value={treasuryData.usdtBalance}
							symbol={EAssets.USDT}
						/>
						<AssetDisplay
							icon={treasuryAssetsData[EAssets.MYTH]?.icon}
							value={treasuryData.mythBalance}
							symbol={EAssets.MYTH}
						/>
					</>
				)}
			</div>

			<TreasuryDetailsDialog
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				data={data?.[0] || null}
			/>
		</div>
	);
}

export default OverviewTreasuryStats;
