// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations, useFormatter } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import MythIcon from '@assets/icons/myth.svg';

function TokenDisplay({ icon, amount, symbol }: { icon: StaticImageData; amount: number; symbol: string }) {
	const format = useFormatter();
	if (!amount) return null;

	const formattedAmount = format.number(amount, {
		notation: 'compact',
		maximumFractionDigits: 2
	});

	return (
		<div className='flex items-center gap-1'>
			<Image
				src={icon}
				alt={symbol}
				width={16}
				height={16}
			/>
			<span className='text-xs text-btn_secondary_text'>
				{formattedAmount} {symbol}
			</span>
		</div>
	);
}
function TreasuryTokensDisplay({
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
		return (
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
		);
	}

	if (treasuryError) {
		return <span className='text-xs text-failure'>{t('dataUnavailable')}</span>;
	}

	return (
		<>
			{stats?.totalDot ? (
				<TokenDisplay
					icon={DotIcon}
					amount={stats.totalDot}
					symbol='DOT'
				/>
			) : null}

			{stats?.totalDot && (stats?.totalUsdc || stats?.totalUsdt || stats?.totalMyth) ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats?.totalUsdc ? (
				<TokenDisplay
					icon={UsdcIcon}
					amount={stats.totalUsdc}
					symbol='USDC'
				/>
			) : null}

			{stats?.totalUsdc && (stats?.totalUsdt || stats?.totalMyth) ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats?.totalUsdt ? (
				<TokenDisplay
					icon={UsdtIcon}
					amount={stats.totalUsdt}
					symbol='USDt'
				/>
			) : null}

			{stats?.totalUsdt && stats?.totalMyth ? (
				<Separator
					orientation='vertical'
					className='h-3'
				/>
			) : null}

			{stats?.totalMyth ? (
				<TokenDisplay
					icon={MythIcon}
					amount={stats.totalMyth}
					symbol='MYTH'
				/>
			) : null}
		</>
	);
}

export default TreasuryTokensDisplay;
