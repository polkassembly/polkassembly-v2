// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React, { ReactElement, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ITreasuryStats, EAssets, ENetwork } from '@/_shared/types';
import Image from 'next/image';
import USDCIcon from '@/_assets/icons/usdc.svg';
import USDTIcon from '@/_assets/icons/usdt.svg';
import MYTHIcon from '@/_assets/icons/myth.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN, BN_ZERO } from '@polkadot/util';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
import { getNetworkLogo } from '@/app/_client-utils/getNetworkLogo';
import { Separator } from '../Separator';

// Component for displaying a single asset row
type AssetRowProps = {
	amount: string;
	asset?: EAssets | null;
	prefix?: string;
	network: ENetwork;
};

// Convert amount to usd for all assets
const formatedAmountWithUSD = ({
	amountsDetails,
	currentTokenPrice,
	network
}: {
	amountsDetails: { amount: string | null; asset: Exclude<EAssets, EAssets.MYTH> | null }[];
	currentTokenPrice: string;
	network: ENetwork;
}) => {
	let totalUSD = BN_ZERO;
	const nativeTokenPriceBN = decimalToBN(currentTokenPrice);
	amountsDetails?.forEach(({ amount, asset }) => {
		if (amount) {
			if (!asset) {
				totalUSD = totalUSD.add(
					nativeTokenPriceBN.value
						.mul(new BN(amount))
						.div(new BN(10).pow(new BN(NETWORKS_DETAILS[`${network}`].tokenDecimals)))
						.div(new BN(10).pow(new BN(nativeTokenPriceBN.decimals)))
				);
			} else {
				totalUSD = totalUSD?.add(new BN(amount).div(new BN(10).pow(new BN(treasuryAssetsData[asset as EAssets]?.tokenDecimal))));
			}
		}
	});

	return formatUSDWithUnits(totalUSD.toString(), 2);
};

function AssetRow({ amount, asset, prefix, network }: AssetRowProps) {
	const ICONS = {
		usdc: USDCIcon,
		usdt: USDTIcon,
		myth: MYTHIcon
	};
	return (
		<div className='flex items-center gap-1 text-sm font-medium dark:text-white max-md:text-xs'>
			<Image
				src={ICONS[asset?.toLowerCase() as keyof typeof ICONS] || getNetworkLogo(network)}
				alt={asset || network}
				width={20}
				height={20}
				className='rounded-full'
			/>
			{asset === EAssets.MYTH ? (
				<span className='font-medium text-muted-foreground'>
					{formatUSDWithUnits(new BN(amount)?.div(new BN(10).pow(new BN(treasuryAssetsData[EAssets.MYTH]?.tokenDecimal)))?.toString(), 2)}{' '}
					{treasuryAssetsData[EAssets.MYTH]?.symbol}
				</span>
			) : (
				<span className='font-medium text-muted-foreground'>
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
	);
}

// Component for a category section
type CategorySectionProps = {
	title: string;
	children: ReactNode;
};

function CategorySection({ title, children }: CategorySectionProps) {
	return (
		<div className='my-2 flex'>
			<h3 className='w-[120px] text-base font-medium text-muted-foreground max-md:text-sm'>{title}</h3>
			<div className='flex flex-col gap-1'>{children}</div>
		</div>
	);
}

// Component for displaying the treasury details
export function TreasuryDetailsDialog({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: ITreasuryStats }): ReactElement {
	const t = useTranslations('TreasuryStats');
	const network = getCurrentNetwork();
	const loanAmounts = TREASURY_NETWORK_CONFIG[`${network}`]?.loanAmounts;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={() => onClose()}
		>
			<DialogContent className='max-w-screen-md bg-bg_modal p-4 lg:p-6'>
				<DialogHeader>
					<DialogTitle className='text-lg font-semibold text-muted-foreground'>{t('treasuryDistribution')}</DialogTitle>
				</DialogHeader>

				<div className='max-h-[70vh] overflow-y-auto'>
					{/* Relay Chain */}
					<CategorySection title={t('relayChain')}>
						<div className='flex flex-col gap-1'>
							<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
								~ $
								{formatedAmountWithUSD({
									amountsDetails: [{ amount: data.relayChain?.dot || null, asset: null }],
									currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
									network
								})}
							</span>
							{data.relayChain?.dot && (
								<AssetRow
									amount={data.relayChain.dot}
									network={network}
								/>
							)}
						</div>
					</CategorySection>

					{/* Asset Hub */}
					<CategorySection title={t('assetHub')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [
									{ amount: data.assetHub?.dot || null, asset: null },
									{ amount: data.assetHub?.usdc || null, asset: EAssets.USDC },
									{ amount: data.assetHub?.usdt || null, asset: EAssets.USDT }
								],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
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
							<Link
								href='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
								className='flex items-center gap-1 text-xs text-text_pink'
							>
								<ExternalLink className='h-4 w-4' />
							</Link>
						</div>
					</CategorySection>

					{/* Hydration */}
					<CategorySection title={t('hydration')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [
									{ amount: data.hydration?.dot || null, asset: null },
									{ amount: data.hydration?.usdc || null, asset: EAssets.USDC },
									{ amount: data.hydration?.usdt || null, asset: EAssets.USDT }
								],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
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
								{t('address')} #1
								<ExternalLink className='h-4 w-4' />
							</Link>
							<Link
								href='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
								className='flex items-center gap-1 text-xs text-text_pink'
							>
								{t('address')} #2
								<ExternalLink className='h-4 w-4' />
							</Link>
						</div>
					</CategorySection>

					<Separator
						className='my-4 w-full'
						orientation='horizontal'
					/>

					{/* Bounties */}
					<CategorySection title={t('bounties')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [{ amount: data.bounties?.dot || null, asset: null }],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
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
						</div>
					</CategorySection>

					{/* Ambassador */}
					<CategorySection title={t('ambassador')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [{ amount: data.ambassador?.usdt || null, asset: EAssets.USDT }],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
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
						</div>
					</CategorySection>

					{/* Fellowship */}
					<CategorySection title={t('fellowship')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [
									{ amount: data.fellowship?.dot || null, asset: null },
									{ amount: data.fellowship?.usdt || null, asset: EAssets.USDT }
								],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
							<Link
								href='https://assethub-polkadot.subscan.io/account/16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'
								className='flex items-center gap-1 text-xs text-text_pink'
							>
								{t('treasury')} <ExternalLink className='h-4 w-4' />
							</Link>
							{data.fellowship?.dot && (
								<AssetRow
									amount={data.fellowship.dot}
									network={network}
								/>
							)}

							<Link
								href='https://assethub-polkadot.subscan.io/account/13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'
								className='flex items-center gap-1 text-xs text-text_pink'
							>
								{t('salary')} <ExternalLink className='h-4 w-4' />
							</Link>
							{data.fellowship?.usdt && (
								<AssetRow
									amount={data.fellowship.usdt}
									asset={EAssets.USDT}
									network={network}
								/>
							)}
						</div>
					</CategorySection>

					{/* Loans */}
					<CategorySection title={t('loans')}>
						<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
							~ $
							{formatedAmountWithUSD({
								amountsDetails: [
									{ amount: loanAmounts?.bifrost?.dot || null, asset: null },
									{ amount: loanAmounts?.centrifuge?.usdc || null, asset: EAssets.USDC },
									{ amount: loanAmounts?.pendulum?.dot || null, asset: null },
									{ amount: loanAmounts?.hydration?.dot || null, asset: null }
								],
								currentTokenPrice: data.nativeTokenUsdPrice || BN_ZERO?.toString(),
								network
							})}
						</span>
						<div className='flex flex-wrap gap-2'>
							<div className='flex flex-wrap gap-2'>
								<Link
									href='https://polkadot.polkassembly.io/referenda/432'
									className='flex items-center gap-1 text-xs text-text_pink'
								>
									Bifrost <ExternalLink className='h-4 w-4' />
								</Link>
								{loanAmounts?.bifrost?.dot && (
									<AssetRow
										amount={loanAmounts.bifrost.dot}
										network={network}
									/>
								)}
							</div>

							<div className='flex flex-wrap gap-2'>
								<Link
									href='https://polkadot.polkassembly.io/referenda/1122'
									className='flex items-center gap-1 text-xs text-text_pink'
								>
									Centrifuge <ExternalLink className='h-4 w-4' />
								</Link>
								{loanAmounts?.centrifuge?.usdc && (
									<AssetRow
										amount={loanAmounts.centrifuge.usdc}
										asset={EAssets.USDC}
										network={network}
									/>
								)}
							</div>
							<div className='flex gap-2'>
								<Link
									href='https://polkadot.polkassembly.io/referenda/748'
									className='flex items-center gap-1 text-xs text-text_pink'
								>
									Pendulum <ExternalLink className='h-4 w-4' />
								</Link>

								{loanAmounts?.pendulum?.dot && (
									<AssetRow
										amount={loanAmounts.pendulum.dot}
										network={network}
									/>
								)}
							</div>
							<div className='flex gap-2'>
								<Link
									href='https://polkadot.polkassembly.io/referenda/560'
									className='flex items-center gap-1 text-xs text-text_pink'
								>
									Hydration <ExternalLink className='h-4 w-4' />
								</Link>

								{loanAmounts?.hydration?.dot && (
									<AssetRow
										amount={loanAmounts.hydration.dot}
										network={network}
									/>
								)}
							</div>
						</div>
					</CategorySection>
				</div>
			</DialogContent>
		</Dialog>
	);
}
