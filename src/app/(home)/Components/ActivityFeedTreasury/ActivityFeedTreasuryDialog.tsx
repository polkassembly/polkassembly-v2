// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import Image, { StaticImageData } from 'next/image';
import RelayIcon from '@assets/icons/relay-chain-icon.svg';
import AssetHubIcon from '@assets/icons/asset-hub-icon.svg';
import HydrationIcon from '@assets/icons/hydration-icon.svg';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Link from 'next/link';
import { ReactElement } from 'react';
import { ITreasuryStats } from '@/_shared/types';
import { Separator } from '@/app/_shared-components/Separator';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';

type TFunction = ReturnType<typeof useTranslations>;

interface TreasuryDetailsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	data: ITreasuryStats;
}

interface TokenValueDisplayProps {
	icon: StaticImageData;
	value: string;
	symbol: string;
}

function TokenValueDisplay({ icon, value, symbol }: TokenValueDisplayProps) {
	const formatted = formatUSDWithUnits(value);

	return (
		<div className='flex items-center gap-1'>
			<Image
				src={icon}
				alt={symbol}
				width={16}
				height={16}
			/>
			<span className='text-sm text-btn_secondary_text'>
				{formatted} {symbol}
			</span>
		</div>
	);
}

interface NetworkSectionProps {
	title: string;
	icon: StaticImageData;
	usdValue: string;
	dotValue: number;
	usdcValue?: number;
	usdtValue?: number;
	usdtExternalLink?: string;
	secondUsdtExternalLink?: string;
	t: TFunction;
}

function NetworkSection({ title, icon, usdValue, dotValue, usdcValue, usdtValue, usdtExternalLink, secondUsdtExternalLink, t }: NetworkSectionProps) {
	return (
		<div className='pt-2'>
			<div className='flex items-center gap-2'>
				<div className='flex items-center gap-1'>
					<Image
						src={icon}
						alt={title}
						className='h-5 w-5'
						width={20}
						height={20}
					/>
					<span className='text-sm text-btn_secondary_text'>{title}</span>
				</div>
				<span className='text-base font-semibold text-btn_secondary_text'>~ ${usdValue}</span>
			</div>
			<div className='flex flex-wrap items-center gap-2 pl-24'>
				<TokenValueDisplay
					icon={DotIcon}
					value={String(dotValue)}
					symbol='DOT'
				/>

				{usdcValue && (
					<div className='flex items-center gap-2'>
						<Separator
							className='h-3'
							orientation='vertical'
						/>
						<TokenValueDisplay
							icon={UsdcIcon}
							value={String(usdcValue)}
							symbol='USDC'
						/>
					</div>
				)}

				{usdtValue && (
					<div className='flex items-center gap-2'>
						<Separator
							className='h-3'
							orientation='vertical'
						/>
						<TokenValueDisplay
							icon={UsdtIcon}
							value={String(usdtValue)}
							symbol='USDt'
						/>
						{usdtExternalLink && (
							<Link
								href={usdtExternalLink}
								className='flex items-center gap-1 text-sm text-text_pink transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								{t('address')} #1 <HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
							</Link>
						)}
						{secondUsdtExternalLink && (
							<Link
								href={secondUsdtExternalLink}
								className='flex items-center gap-1 text-sm text-text_pink transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								{t('address')} #2 <HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

interface OtherSectionProps {
	title: string;
	usdValue: string;
	dotValue: number;
	externalLink?: string;
	fellowshipUsdt?: number;
}

function OtherSection({ title, usdValue, dotValue, externalLink, fellowshipUsdt }: OtherSectionProps) {
	return (
		<div>
			<div className='flex items-center gap-2 text-btn_secondary_text'>
				<span className='text-sm'>{title}</span>
				<span className='text-base font-semibold'>~ ${usdValue}</span>
			</div>
			<div className='mt-1 flex flex-wrap items-center gap-2 pl-20'>
				<TokenValueDisplay
					icon={DotIcon}
					value={String(dotValue)}
					symbol='DOT'
				/>
				{externalLink && (
					<Link
						href={externalLink}
						target='_blank'
						rel='noopener noreferrer'
						className='text-text_pink transition-colors'
					>
						<HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
					</Link>
				)}
				{fellowshipUsdt && (
					<div className='flex items-center gap-2'>
						<Separator
							className='h-3'
							orientation='vertical'
						/>
						<TokenValueDisplay
							icon={UsdtIcon}
							value={String(fellowshipUsdt)}
							symbol='USDt'
						/>
					</div>
				)}
			</div>
		</div>
	);
}

// Helper function to get the exact DOT value
const getExactDot = (dotAmount: string): number => {
	return Number(dotAmount) / 1e10 || 0;
};

// Helper function to get the exact token amount with a given divisor
const getExactTokenAmount = (amount: string, divisor: number = 1e6): number => {
	return Number(amount) / divisor || 0;
};

// Calculate USD values
const calculateUsdValues = (data: ITreasuryStats) => {
	// Helper function to format DOT to USD
	const formatDotToUsd = (dotAmount: string): string => {
		const dot = getExactDot(dotAmount);
		const usdValue = dot * Number(data.nativeTokenUsdPrice);
		return formatUSDWithUnits(usdValue.toString());
	};

	// Helper function to get the exact USD value for a given DOT amount
	const getExactDotToUsd = (dotAmount: string): string => {
		const dot = getExactDot(dotAmount);
		return (dot * Number(data.nativeTokenUsdPrice)).toString();
	};

	return {
		// Formatted USD values
		relayChainUsd: formatDotToUsd(data?.relayChain?.dot || '0'),
		assetHubUsd: formatDotToUsd(data?.assetHub?.dot || '0'),
		hydrationUsd: formatDotToUsd(data?.hydration?.dot || '0'),
		bountiesUsd: formatDotToUsd(data?.bounties?.dot || '0'),
		ambassadorUsd: formatDotToUsd(data?.ambassador?.dot || '0'),
		fellowshipUsd: formatDotToUsd(data?.fellowship?.dot || '0'),
		loansUsd: formatDotToUsd(data?.loans?.dot || '0'),

		// Exact USD values
		exactRelayChainUsd: getExactDotToUsd(data?.relayChain?.dot || '0'),
		exactAssetHubUsd: getExactDotToUsd(data?.assetHub?.dot || '0'),
		exactHydrationUsd: getExactDotToUsd(data?.hydration?.dot || '0'),
		exactBountiesUsd: getExactDotToUsd(data?.bounties?.dot || '0'),
		exactAmbassadorUsd: getExactDotToUsd(data?.ambassador?.dot || '0'),
		exactFellowshipUsd: getExactDotToUsd(data?.fellowship?.dot || '0'),
		exactLoansUsd: getExactDotToUsd(data?.loans?.dot || '0')
	};
};

const calculateTokenAmounts = (data: ITreasuryStats) => {
	return {
		relayChainDot: getExactDot(data?.relayChain?.dot || '0'),
		assetHubDot: getExactDot(data?.assetHub?.dot || '0'),
		assetHubUsdc: getExactTokenAmount(data?.assetHub?.usdc || '0'),
		assetHubUsdt: getExactTokenAmount(data?.assetHub?.usdt || '0'),
		hydrationDot: getExactDot(data?.hydration?.dot || '0'),
		hydrationUsdc: getExactTokenAmount(data?.hydration?.usdc || '0'),
		hydrationUsdt: getExactTokenAmount(data?.hydration?.usdt || '0'),
		bountiesDot: getExactDot(data?.bounties?.dot || '0'),
		ambassadorValue: data?.ambassador?.dot ? getExactDot(data.ambassador.dot) : getExactTokenAmount(data?.ambassador?.usdt || '0'),
		fellowshipDot: getExactDot(data?.fellowship?.dot || '0'),
		fellowshipUsdt: getExactTokenAmount(data?.fellowship?.usdt || '0')
	};
};

const formatTreasuryValues = (data: ITreasuryStats) => {
	return {
		...calculateUsdValues(data),
		...calculateTokenAmounts(data)
	};
};

const renderNetworkSection = (data: ITreasuryStats, treasury: ReturnType<typeof formatTreasuryValues>, t: TFunction) => (
	<div>
		<NetworkSection
			title={t('relayChain')}
			icon={RelayIcon}
			usdValue={treasury.relayChainUsd}
			dotValue={treasury.relayChainDot}
			t={t}
		/>
		<NetworkSection
			title={t('assetHub')}
			icon={AssetHubIcon}
			usdValue={treasury.assetHubUsd}
			dotValue={treasury.assetHubDot}
			usdcValue={treasury.assetHubUsdc}
			usdtValue={treasury.assetHubUsdt}
			usdtExternalLink='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
			t={t}
		/>
		<NetworkSection
			title={t('hydration')}
			icon={HydrationIcon}
			usdValue={treasury.hydrationUsd}
			dotValue={treasury.hydrationDot}
			usdcValue={treasury.hydrationUsdc}
			usdtValue={treasury.hydrationUsdt}
			usdtExternalLink='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
			secondUsdtExternalLink='https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'
			t={t}
		/>
	</div>
);

interface LoanItemProps {
	title: string;
	dotValue: string;
	link: string;
	icon: StaticImageData;
}

function LoanItem({ title, dotValue, link, icon }: LoanItemProps) {
	return (
		<div className='flex items-center gap-2'>
			<Link
				href={link}
				className='text-sm text-text_pink transition-colors'
				target='_blank'
				rel='noopener noreferrer'
			>
				{title}
			</Link>
			<Image
				src={icon}
				alt={title}
				width={16}
				height={16}
			/>
			<span className='text-sm text-btn_secondary_text'>{dotValue}</span>
		</div>
	);
}

interface LoansSectionProps {
	data: ITreasuryStats;
	treasury: ReturnType<typeof formatTreasuryValues>;
	t: TFunction;
}

function LoansSection({ data, treasury, t }: LoansSectionProps) {
	return (
		<div>
			<div className='flex items-center gap-2'>
				<span className='text-sm text-btn_secondary_text'>{t('loans')}</span>
				<span className='text-sm font-semibold text-btn_secondary_text'>~ ${treasury.loansUsd}</span>
				<span className='hidden'>{`$${treasury.exactLoansUsd}`}</span>
			</div>
			<div className='mt-1 flex flex-wrap items-center gap-x-2 pl-10'>
				<LoanItem
					title='Bifrost'
					dotValue='500.0K'
					link='https://polkadot.polkassembly.io/referenda/432'
					icon={DotIcon}
				/>
				<LoanItem
					title='Pendulum'
					dotValue='50.0K'
					link='https://polkadot.polkassembly.io/referenda/748'
					icon={DotIcon}
				/>
				<LoanItem
					title='Hydration'
					dotValue='1M'
					link='https://polkadot.polkassembly.io/referenda/560'
					icon={DotIcon}
				/>
				<LoanItem
					title='Centrifuge'
					dotValue={data.loans?.usdc ? '1.5M USDC' : 'N/A'}
					link='https://polkadot.polkassembly.io/referenda/1122'
					icon={UsdcIcon}
				/>
			</div>
		</div>
	);
}

const renderOtherSections = (data: ITreasuryStats, treasury: ReturnType<typeof formatTreasuryValues>, t: TFunction) => (
	<div>
		<OtherSection
			title={t('bounties')}
			usdValue={treasury.bountiesUsd}
			dotValue={treasury.bountiesDot}
			externalLink='https://polkadot.polkassembly.io/bounty-dashboard'
		/>
		<OtherSection
			title={t('ambassador')}
			usdValue={String(formatUSDWithUnits(treasury.ambassadorValue.toString()))}
			dotValue={treasury.ambassadorValue}
			externalLink='https://assethub-polkadot.subscan.io/account/13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'
		/>
		<OtherSection
			title={t('fellowships')}
			usdValue={treasury.fellowshipUsd}
			dotValue={treasury.fellowshipDot}
			fellowshipUsdt={treasury.fellowshipUsdt}
		/>
		<LoansSection
			data={data}
			treasury={treasury}
			t={t}
		/>
	</div>
);

export function TreasuryDetailsDialog({ isOpen, onClose, data }: TreasuryDetailsDialogProps): ReactElement {
	const isDataLoaded = !!data;
	const treasury = isDataLoaded ? formatTreasuryValues(data) : null;
	const t = useTranslations();
	return (
		<Dialog
			open={isOpen}
			onOpenChange={() => onClose()}
		>
			<DialogContent className='bg-bg_modal p-4 lg:max-w-4xl lg:p-6'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-medium text-slate-800'>{t('treasuryDistribution')}</DialogTitle>
				</DialogHeader>
				{!isDataLoaded ? (
					<div className='py-2 text-center'>{t('loadingTreasuryData')}</div>
				) : (
					<div>
						<h2 className='text-text_grey'>{t('acrossNetworks')}</h2>
						{renderNetworkSection(data, treasury!, t)}
						<div className='my-4 border-t border-border_grey' />
						{renderOtherSections(data, treasury!, t)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
