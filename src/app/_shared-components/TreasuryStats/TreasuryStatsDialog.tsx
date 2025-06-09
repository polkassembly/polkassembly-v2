// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React, { ReactElement, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ITreasuryStats, EAssets, ENetwork } from '@/_shared/types';
import Image from 'next/image';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN, BN_ZERO } from '@polkadot/util';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
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
	return (
		<div className='flex items-center gap-1 text-sm font-medium dark:text-white max-md:text-xs'>
			<Image
				src={treasuryAssetsData[asset as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo}
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

// Relay Chain Section Component
function RelayChainSection({ data, network, currentTokenPrice, title }: { data: ITreasuryStats; network: ENetwork; currentTokenPrice: string; title: string }) {
	return (
		<CategorySection title={title}>
			<div className='flex flex-col gap-1'>
				<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
					~ $
					{formatedAmountWithUSD({
						amountsDetails: [{ amount: data.relayChain?.nativeToken || null, asset: null }],
						currentTokenPrice,
						network
					})}
				</span>
				{data.relayChain?.nativeToken && (
					<AssetRow
						amount={data.relayChain.nativeToken}
						network={network}
					/>
				)}
			</div>
		</CategorySection>
	);
}

// Asset Hub Section Component
function AssetHubSection({
	data,
	network,
	currentTokenPrice,
	assetHubTreasuryAddress,
	title
}: {
	data: ITreasuryStats;
	network: ENetwork;
	currentTokenPrice: string;
	assetHubTreasuryAddress: string;
	title: string;
}) {
	if (!assetHubTreasuryAddress || assetHubTreasuryAddress.trim() === '') return null;

	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [
						{ amount: data.assetHub?.nativeToken || null, asset: null },
						{ amount: data.assetHub?.usdc || null, asset: EAssets.USDC },
						{ amount: data.assetHub?.usdt || null, asset: EAssets.USDT }
					],
					currentTokenPrice,
					network
				})}
			</span>
			<div className='flex flex-wrap gap-2'>
				{data.assetHub?.nativeToken && (
					<AssetRow
						amount={data.assetHub.nativeToken}
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
					href={`https://assethub-${network}.subscan.io/account/${assetHubTreasuryAddress}`}
					className='flex items-center gap-1 text-xs text-text_pink'
					target='_blank'
				>
					<ExternalLink className='h-4 w-4' />
				</Link>
			</div>
		</CategorySection>
	);
}

// Hydration Section Component
function HydrationSection({
	data,
	network,
	currentTokenPrice,
	hydrationAddresses,
	title
}: {
	data: ITreasuryStats;
	network: ENetwork;
	currentTokenPrice: string;
	hydrationAddresses: string[] | undefined;
	title: string;
}) {
	const t = useTranslations('TreasuryStats');
	if (!hydrationAddresses || hydrationAddresses.length === 0 || hydrationAddresses.every((addr) => !addr || addr.trim() === '')) return null;

	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [
						{ amount: data.hydration?.nativeToken || null, asset: null },
						{ amount: data.hydration?.usdc || null, asset: EAssets.USDC },
						{ amount: data.hydration?.usdt || null, asset: EAssets.USDT }
					],
					currentTokenPrice,
					network
				})}
			</span>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-wrap gap-2'>
					{data.hydration?.nativeToken && (
						<AssetRow
							amount={data.hydration.nativeToken}
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
				</div>
				<div className='flex gap-2'>
					{hydrationAddresses?.map((address, index) => (
						<Link
							key={address}
							href={`https://hydration.subscan.io/account/${address}`}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							{t('address')} #{index + 1}
							<ExternalLink className='h-4 w-4' />
						</Link>
					))}
				</div>
			</div>
		</CategorySection>
	);
}

// Bounties Section Component
function BountiesSection({ data, network, currentTokenPrice, title }: { data: ITreasuryStats; network: ENetwork; currentTokenPrice: string; title: string }) {
	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [{ amount: data.bounties?.nativeToken || null, asset: null }],
					currentTokenPrice,
					network
				})}
			</span>
			<div className='flex flex-wrap gap-2'>
				{data.bounties?.nativeToken && (
					<AssetRow
						amount={data.bounties.nativeToken}
						network={network}
					/>
				)}
				<Link
					href={`https://${network}.polkassembly.io/bounty-dashboard`}
					className='flex items-center gap-1 text-xs text-text_pink'
					target='_blank'
				>
					<ExternalLink className='h-4 w-4' />
				</Link>
			</div>
		</CategorySection>
	);
}

// Ambassador Section Component
function AmbassadorSection({
	data,
	network,
	currentTokenPrice,
	ambassadorAddress,
	title
}: {
	data: ITreasuryStats;
	network: ENetwork;
	currentTokenPrice: string;
	ambassadorAddress: string | undefined;
	title: string;
}) {
	if (!ambassadorAddress || ambassadorAddress.trim() === '') return null;

	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [{ amount: data.ambassador?.usdt || null, asset: EAssets.USDT }],
					currentTokenPrice,
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
					href={`https://assethub-${network}.subscan.io/account/${ambassadorAddress}`}
					className='flex items-center gap-1 text-xs text-text_pink'
					target='_blank'
				>
					<ExternalLink className='h-4 w-4' />
				</Link>
			</div>
		</CategorySection>
	);
}

// Fellowship Section Component
function FellowshipSection({
	data,
	network,
	currentTokenPrice,
	fellowshipAddress,
	title
}: {
	data: ITreasuryStats;
	network: ENetwork;
	currentTokenPrice: string;
	fellowshipAddress: { treasury?: string; salary?: string } | undefined;
	title: string;
}) {
	const t = useTranslations('TreasuryStats');
	const hasTreasury = fellowshipAddress?.treasury && fellowshipAddress.treasury.trim() !== '';
	const hasSalary = fellowshipAddress?.salary && fellowshipAddress.salary.trim() !== '';

	if (!hasTreasury && !hasSalary) return null;

	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [
						{ amount: data.fellowship?.nativeToken || null, asset: null },
						{ amount: data.fellowship?.usdt || null, asset: EAssets.USDT }
					],
					currentTokenPrice,
					network
				})}
			</span>
			<div className='flex flex-wrap gap-2'>
				{hasTreasury && (
					<>
						<Link
							href={`https://assethub-${network}.subscan.io/account/${fellowshipAddress?.treasury}`}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							{t('treasury')} <ExternalLink className='h-4 w-4' />
						</Link>
						{data.fellowship?.nativeToken && (
							<AssetRow
								amount={data.fellowship.nativeToken}
								network={network}
							/>
						)}
					</>
				)}
				{hasSalary && (
					<>
						<Link
							href={`https://assethub-${network}.subscan.io/account/${fellowshipAddress?.salary}`}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
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
					</>
				)}
			</div>
		</CategorySection>
	);
}

// Loans Section Component
function LoansSection({
	network,
	currentTokenPrice,
	loanAmounts,
	title
}: {
	network: ENetwork;
	currentTokenPrice: string;
	loanAmounts: {
		centrifuge?: {
			usdc: string;
			link?: string;
		};
		bifrost?: {
			nativeToken: string;
			link?: string;
		};
		pendulum?: {
			nativeToken: string;
			link?: string;
		};
		hydration?: {
			nativeToken?: string;
			link?: string;
		};
	} | null;
	title: string;
}) {
	return (
		<CategorySection title={title}>
			<span className='text-base font-bold text-muted-foreground max-md:text-sm'>
				~ $
				{formatedAmountWithUSD({
					amountsDetails: [
						{ amount: loanAmounts?.bifrost?.nativeToken || null, asset: null },
						{ amount: loanAmounts?.centrifuge?.usdc || null, asset: EAssets.USDC },
						{ amount: loanAmounts?.pendulum?.nativeToken || null, asset: null },
						{ amount: loanAmounts?.hydration?.nativeToken || null, asset: null }
					],
					currentTokenPrice,
					network
				})}
			</span>
			<div className='flex flex-wrap gap-2'>
				{loanAmounts?.bifrost?.nativeToken && loanAmounts.bifrost.nativeToken.trim() !== '' && (
					<div className='flex flex-wrap gap-2'>
						<Link
							href={loanAmounts?.bifrost?.link || ''}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							Bifrost <ExternalLink className='h-4 w-4' />
						</Link>
						<AssetRow
							amount={loanAmounts.bifrost.nativeToken}
							network={network}
						/>
					</div>
				)}
				{loanAmounts?.centrifuge?.usdc && loanAmounts.centrifuge.usdc.trim() !== '' && (
					<div className='flex flex-wrap gap-2'>
						<Link
							href={loanAmounts?.centrifuge?.link || ''}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							Centrifuge <ExternalLink className='h-4 w-4' />
						</Link>
						<AssetRow
							amount={loanAmounts.centrifuge.usdc}
							asset={EAssets.USDC}
							network={network}
						/>
					</div>
				)}
				{loanAmounts?.pendulum?.nativeToken && loanAmounts.pendulum.nativeToken.trim() !== '' && (
					<div className='flex gap-2'>
						<Link
							href={loanAmounts?.pendulum?.link || ''}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							Pendulum <ExternalLink className='h-4 w-4' />
						</Link>
						<AssetRow
							amount={loanAmounts.pendulum.nativeToken}
							network={network}
						/>
					</div>
				)}
				{loanAmounts?.hydration?.nativeToken && loanAmounts.hydration.nativeToken.trim() !== '' && (
					<div className='flex gap-2'>
						<Link
							href={loanAmounts?.hydration?.link || ''}
							className='flex items-center gap-1 text-xs text-text_pink'
							target='_blank'
						>
							Hydration <ExternalLink className='h-4 w-4' />
						</Link>
						<AssetRow
							amount={loanAmounts.hydration.nativeToken}
							network={network}
						/>
					</div>
				)}
			</div>
		</CategorySection>
	);
}

// Component for displaying the treasury details
export function TreasuryDetailsDialog({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: ITreasuryStats }): ReactElement {
	const t = useTranslations('TreasuryStats');
	const network = getCurrentNetwork();
	const treasuryConfig = TREASURY_NETWORK_CONFIG[`${network}`];

	// Early return if treasury config is not available for this network
	if (!treasuryConfig) {
		return (
			<Dialog
				open={isOpen}
				onOpenChange={() => onClose()}
			>
				<DialogContent className='max-w-screen-md bg-bg_modal p-4 lg:p-6'>
					<DialogHeader>
						<DialogTitle className='text-lg font-semibold text-muted-foreground'>{t('treasuryDistribution')}</DialogTitle>
					</DialogHeader>
					<div className='text-center text-muted-foreground'>{t('treasuryNotSupported')}</div>
				</DialogContent>
			</Dialog>
		);
	}

	const { loanAmounts } = treasuryConfig;
	const { ambassadorAddress } = treasuryConfig;
	const { fellowshipAddress } = treasuryConfig;
	const { assetHubTreasuryAddress } = treasuryConfig;
	const { hydrationAddresses } = treasuryConfig;
	const currentTokenPrice = data.nativeTokenUsdPrice || BN_ZERO?.toString();

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
					<RelayChainSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						title={t('relayChain')}
					/>

					<AssetHubSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						assetHubTreasuryAddress={assetHubTreasuryAddress!}
						title={t('assetHub')}
					/>

					<HydrationSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						hydrationAddresses={hydrationAddresses}
						title={t('hydration')}
					/>

					<Separator
						className='my-4 w-full'
						orientation='horizontal'
					/>

					<BountiesSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						title={t('bounties')}
					/>

					<AmbassadorSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						ambassadorAddress={ambassadorAddress}
						title={t('ambassador')}
					/>

					<FellowshipSection
						data={data}
						network={network}
						currentTokenPrice={currentTokenPrice}
						fellowshipAddress={fellowshipAddress}
						title={t('fellowship')}
					/>

					<LoansSection
						network={network}
						currentTokenPrice={currentTokenPrice}
						loanAmounts={loanAmounts || null}
						title={t('loans')}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
