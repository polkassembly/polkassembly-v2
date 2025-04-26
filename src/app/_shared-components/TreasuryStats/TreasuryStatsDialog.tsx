// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React, { ReactElement, ReactNode, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { ITreasuryStats, EAssets, ENetwork } from '@/_shared/types';
import Image from 'next/image';
import USDCIcon from '@/_assets/icons/usdc.svg';
import USDTIcon from '@/_assets/icons/usdt.svg';
import MYTHIcon from '@/_assets/icons/myth.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getNetworkLogo } from '@/_shared/_utils/getNetworkLogo';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN } from '@polkadot/util';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const getAssetIcon = ({ network, asset }: { network: ENetwork; asset?: EAssets | null }) => {
	if (!asset)
		return (
			<Image
				src={getNetworkLogo(network)}
				alt='USDC'
				width={20}
				height={20}
				className='rounded-full'
			/>
		);
	switch (asset) {
		case EAssets.USDC:
			return (
				<Image
					src={USDCIcon}
					alt='USDC'
					width={20}
					height={20}
				/>
			);
		case EAssets.USDT:
			return (
				<Image
					src={USDTIcon}
					alt='USDT'
					width={20}
					height={20}
				/>
			);
		case EAssets.MYTH:
			return (
				<Image
					src={MYTHIcon}
					alt='MYTH'
					width={20}
					height={20}
				/>
			);
		default:
			return null;
	}
};

// Component for displaying a single asset row
type AssetRowProps = {
	amount: string;
	asset?: EAssets | null;
	prefix?: string;
	network: ENetwork;
};

const AssetRow = forwardRef<HTMLDivElement, AssetRowProps>(({ amount, asset, prefix, network }, ref) => {
	return (
		<div
			className='flex items-center justify-between py-1'
			ref={ref}
		>
			<div className='flex items-center gap-1 text-sm'>
				{getAssetIcon({ network, asset })}
				{asset === EAssets.MYTH ? (
					<span className='font-medium text-basic_text'>
						{formatUSDWithUnits(new BN(amount)?.div(new BN(10).pow(new BN(treasuryAssetsData[EAssets.MYTH]?.tokenDecimal)))?.toString(), 2)}{' '}
						{treasuryAssetsData[EAssets.MYTH]?.symbol}
					</span>
				) : (
					<span className='font-medium text-basic_text'>
						{prefix || ''}
						{formatBnBalance(
							amount,
							{ withUnit: true, numberAfterComma: 2, compactNotation: true },
							network,
							Object.values(NETWORKS_DETAILS[`${network}`]?.supportedAssets)?.find((supportedAsset) => supportedAsset.symbol === asset)?.index
						)}
					</span>
				)}
			</div>
		</div>
	);
});

AssetRow.displayName = 'AssetRow';

// Component for a category section
type CategorySectionProps = {
	title: string;
	children: ReactNode;
};

const CategorySection = forwardRef<HTMLDivElement, CategorySectionProps>(({ title, children }, ref) => {
	return (
		<div
			className='mb-1 flex flex-col gap-1 border-b border-b-border_grey pb-1'
			ref={ref}
		>
			<h3 className='text-lg font-medium text-muted-foreground dark:text-white'>{title}</h3>
			<div className='flex gap-x-2 rounded-lg bg-bg_modal py-2'>{children}</div>
		</div>
	);
});

CategorySection.displayName = 'CategorySection';

export function TreasuryDetailsDialog({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: ITreasuryStats }): ReactElement {
	const t = useTranslations('TreasuryStats');
	const network = getCurrentNetwork();

	return (
		<Dialog
			open={isOpen}
			onOpenChange={() => onClose()}
		>
			<DialogContent className='max-w-screen-md bg-bg_modal p-4 lg:p-6'>
				<DialogHeader>
					<DialogTitle className='text-lg font-medium text-muted-foreground'>{t('treasuryDistribution')}</DialogTitle>
				</DialogHeader>

				<div className='mt-4 max-h-[70vh] overflow-y-auto'>
					{/* Relay Chain */}
					<CategorySection title='Relay Chain'>
						{data.relayChain?.dot && (
							<AssetRow
								amount={data.relayChain.dot}
								network={network}
							/>
						)}
					</CategorySection>

					{/* Asset Hub */}
					<CategorySection title='Asset Hub'>
						{data.assetHub?.dot && (
							<AssetRow
								amount={data.assetHub.dot}
								network={network}
							/>
						)}
						{data.assetHub?.usdc && (
							<AssetRow
								amount={data.assetHub.usdc}
								asset={EAssets.USDC}
								network={network}
							/>
						)}

						{data.assetHub?.usdt && (
							<AssetRow
								amount={data.assetHub.usdt}
								asset={EAssets.USDT}
								network={network}
							/>
						)}

						{data.assetHub?.myth && (
							<AssetRow
								amount={data.assetHub.myth}
								asset={EAssets.MYTH}
								network={network}
							/>
						)}
						<Link
							href='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							<ExternalLink className='h-4 w-4' />
						</Link>
					</CategorySection>

					{/* Hydration */}
					<CategorySection title='Hydration'>
						{data.hydration?.dot && (
							<AssetRow
								amount={data.hydration.dot}
								network={network}
							/>
						)}
						{data.hydration?.usdc && (
							<AssetRow
								amount={data.hydration.usdc}
								asset={EAssets.USDC}
								network={network}
							/>
						)}
						{data.hydration?.usdt && (
							<AssetRow
								amount={data.hydration.usdt}
								asset={EAssets.USDT}
								network={network}
							/>
						)}
						<Link
							href='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							Address 1<ExternalLink className='h-4 w-4' />
						</Link>
						<Link
							href='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							Address 2<ExternalLink className='h-4 w-4' />
						</Link>
					</CategorySection>

					{/* Bounties */}
					<CategorySection title='Bounties'>
						{data.bounties?.dot && (
							<AssetRow
								amount={data.bounties.dot}
								network={network}
							/>
						)}
						<Link
							href='https://polkadot.polkassembly.io/bounty-dashboard'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							<ExternalLink className='h-4 w-4' />
						</Link>
					</CategorySection>

					{/* Fellowship */}
					<CategorySection title='Fellowship'>
						{data.fellowship?.dot && (
							<AssetRow
								amount={data.fellowship.dot}
								network={network}
							/>
						)}
						<Link
							href='https://assethub-polkadot.subscan.io/account/16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							<ExternalLink className='h-4 w-4' />
						</Link>

						{data.fellowship?.usdt && (
							<AssetRow
								amount={data.fellowship.usdt}
								asset={EAssets.USDT}
								network={network}
							/>
						)}
						<Link
							href='https://assethub-polkadot.subscan.io/account/13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							<ExternalLink className='h-4 w-4' />
						</Link>
					</CategorySection>

					{/* Ambassador */}
					<CategorySection title='Ambassador'>
						{data.ambassador?.usdt && (
							<AssetRow
								amount={data.ambassador.usdt}
								asset={EAssets.USDT}
								network={network}
							/>
						)}
						<Link
							href='https://assethub-polkadot.subscan.io/account/13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'
							className='flex items-center gap-1 text-xs text-text_pink'
						>
							<ExternalLink className='h-4 w-4' />
						</Link>
					</CategorySection>

					{/* Loans */}
					<CategorySection title='Loans'>
						{data.loans?.dot && (
							<AssetRow
								amount={data.loans.dot}
								network={network}
							/>
						)}

						{data.loans?.usdc && (
							<AssetRow
								amount={data.loans.usdc}
								asset={EAssets.USDC}
								network={network}
							/>
						)}
					</CategorySection>
				</div>
			</DialogContent>
		</Dialog>
	);
}
