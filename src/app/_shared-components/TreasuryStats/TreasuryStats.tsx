// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EAssets, ENetwork } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import Image from 'next/image';
import USDCIcon from '@/_assets/icons/usdc.svg';
import USDTIcon from '@/_assets/icons/usdt.svg';
import MYTHIcon from '@/_assets/icons/myth.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { getNetworkLogo } from '@/_shared/_utils/getNetworkLogo';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './TreasuryStats.module.scss';
import { TooltipContent, TooltipTrigger, Tooltip } from '../Tooltip';
import { Separator } from '../Separator';
import { Button } from '../Button';
import { TreasuryDetailsDialog } from './TreasuryStatsDialog';
import { Skeleton } from '../Skeleton';

function TreasuryStats({ isActivityFeed = true }: { isActivityFeed?: boolean }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const tokenSymbol = NETWORKS_DETAILS?.[network as ENetwork]?.tokenSymbol;
	const [isOpen, setIsOpen] = useState(false);

	const getTreasuryStats = async () => {
		const to = new Date();
		const from = new Date();
		from.setFullYear(to.getFullYear() - 1);
		const { data, error } = await NextApiClientService.getTreasuryStats({ from, to });
		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['treasuryStats'],
		queryFn: getTreasuryStats,
		enabled: !!network
	});

	const priceChange = data?.[0]?.nativeTokenUsdPrice24hChange;
	const isPriceUp = priceChange && parseFloat(priceChange) >= 0;
	const priceChangeText = isPriceUp ? `+${Number(priceChange).toFixed(2)}%` : `${Number(priceChange).toFixed(2)}%`;

	return isFetching || !data ? (
		<Skeleton className='h-full w-full' />
	) : (
		<div className={styles.treasuryStatsContainer}>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					<h2 className='text-lg font-bold text-muted-foreground dark:text-white'>{t('TreasuryStats.treasury')}</h2>
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
						<div className='flex items-center'>
							<div className='flex items-start gap-2'>
								<div className='flex items-center'>
									<span className='mr-2 flex text-xs font-medium capitalize text-muted-foreground'>
										{tokenSymbol} {t('TreasuryStats.price')}
									</span>
									<span className='text-sm font-bold'>${formatUSDWithUnits(data?.[0]?.nativeTokenUsdPrice || BN_ZERO?.toString(), 2)}</span>
								</div>
								<span className={cn('flex items-center gap-1 text-xs', isPriceUp ? 'text-success' : 'text-destructive')}>
									{priceChangeText || 'NaN%'} {isPriceUp ? '▲' : '▼'}
								</span>
							</div>
						</div>
					</div>
				) : (
					<Button
						variant='link'
						size='sm'
						onClick={() => setIsOpen(true)}
						className='border-none p-0 text-sm font-medium text-text_pink'
					>
						{t('TreasuryStats.details')}
					</Button>
				)}
			</div>

			<div className='mt-2'>
				<div className='flex items-center gap-1'>
					<h1 className='text-base font-bold'>~${formatUSDWithUnits(data?.[0]?.total?.totalInUsd || BN_ZERO?.toString(), 2)}</h1>
					{!isActivityFeed && (
						<Button
							variant='link'
							size='sm'
							onClick={() => setIsOpen(true)}
							className='border-none p-0 text-sm font-medium text-text_pink'
						>
							{t('TreasuryStats.details')}
						</Button>
					)}
				</div>
				<div className='mt-2 flex flex-wrap gap-2 text-xs'>
					<div className='flex items-center'>
						<Image
							src={getNetworkLogo(network)}
							alt={network}
							width={16}
							height={16}
							className='mr-2 rounded-full'
						/>
						<span className='font-medium'>{formatBnBalance(data?.[0]?.total?.totalDot || BN_ZERO, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</span>
					</div>
					<Separator
						orientation='vertical'
						className='hidden h-3 lg:block'
					/>

					<div className='flex items-center text-xs'>
						<Image
							src={USDCIcon}
							alt='USDC'
							width={16}
							height={16}
							className='mr-2'
						/>
						<span className='font-medium'>
							{formatBnBalance(
								data?.[0]?.total?.totalUsdc || BN_ZERO?.toString(),
								{ withUnit: true, numberAfterComma: 2, compactNotation: true },
								network,
								Object.values(NETWORKS_DETAILS[`${network}`]?.supportedAssets)?.find((supportedAsset) => supportedAsset.symbol === EAssets.USDC)?.index
							)}
						</span>
					</div>

					<div className='flex items-center text-xs'>
						<Image
							src={USDTIcon}
							alt='USDT'
							width={16}
							height={16}
							className='mr-2'
						/>
						<span className='font-medium'>
							{formatBnBalance(
								data?.[0]?.total?.totalUsdt || BN_ZERO?.toString(),
								{ withUnit: true, numberAfterComma: 2, compactNotation: true },
								network,
								Object.values(NETWORKS_DETAILS[`${network}`]?.supportedAssets)?.find((supportedAsset) => supportedAsset.symbol === EAssets.USDT)?.index
							)}
						</span>
					</div>
					<Separator
						orientation='vertical'
						className='hidden h-3 lg:block'
					/>

					<div className='flex items-center text-xs'>
						<Image
							src={MYTHIcon}
							alt='MYTH'
							width={16}
							height={16}
							className='mr-2'
						/>
						<span className='font-medium'>
							{formatUSDWithUnits(
								new BN(data?.[0]?.total?.totalMyth || BN_ZERO?.toString())?.div(new BN(10).pow(new BN(treasuryAssetsData[EAssets.MYTH]?.tokenDecimal)))?.toString(),
								2
							)}{' '}
							{treasuryAssetsData[EAssets.MYTH]?.symbol}
						</span>
					</div>
				</div>
			</div>

			{isActivityFeed && (
				<div className='mt-4 flex items-center justify-center rounded-md bg-bg_code py-2 text-xs shadow-sm'>
					<div className='flex items-center'>
						<div className='flex items-center gap-2'>
							<div className='flex items-center'>
								<span className='mr-2 flex items-center text-xs font-medium capitalize text-muted-foreground'>
									{tokenSymbol} {t('TreasuryStats.price')}
								</span>
								<span className='text-sm font-bold'>${formatUSDWithUnits(data?.[0]?.nativeTokenUsdPrice || BN_ZERO?.toString(), 2)}</span>
							</div>
							<span className={`text-xs ${isPriceUp ? 'text-success' : 'text-destructive'}`}>
								{priceChangeText || 'NaN%'} {isPriceUp ? '▲' : '▼'}
							</span>
						</div>
					</div>
				</div>
			)}
			<TreasuryDetailsDialog
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				data={data?.[0] || null}
			/>
		</div>
	);
}

export default TreasuryStats;
