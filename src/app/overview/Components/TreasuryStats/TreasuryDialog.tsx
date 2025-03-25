// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import Image, { StaticImageData } from 'next/image';
import RelayIcon from '@assets/icons/relay-chain-icon.svg';
import AssetHubIcon from '@assets/icons/asset-hub-icon.svg';
import HydrationIcon from '@assets/icons/hydration-icon.svg';
import { ITreasuryStats } from '@/_shared/types';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Link from 'next/link';
import { Tooltip } from '@ui/Tooltip';

/**
 * Formats a number with appropriate units (B, M, K) based on its magnitude.
 */
export default function formatUSDWithUnits(value: string | number, toFixed: number = 2): string {
	// Handle NaN, null, undefined inputs
	if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
		return '0';
	}

	let numValue = typeof value === 'string' ? parseFloat(value) : value;
	let suffix = '';

	// Handle string inputs that might already have a suffix
	if (typeof value === 'string') {
		const arr = value.split(' ');
		if (arr.length > 1) {
			numValue = parseFloat(arr[0]);
			suffix = ` ${arr[1]}`;
		}
	}

	// Format based on magnitude
	let formatted = '';
	if (Math.abs(numValue) >= 1.0e9) {
		formatted = (Math.abs(numValue) / 1.0e9).toFixed(toFixed);
		suffix = `B${suffix}`;
	} else if (Math.abs(numValue) >= 1.0e6) {
		formatted = (Math.abs(numValue) / 1.0e6).toFixed(toFixed);
		suffix = `M${suffix}`;
	} else if (Math.abs(numValue) >= 1.0e3) {
		formatted = (Math.abs(numValue) / 1.0e3).toFixed(toFixed);
		suffix = `K${suffix}`;
	} else {
		formatted = Math.abs(numValue).toFixed(toFixed);
	}

	// Remove trailing zeros after decimal point, but keep at least one digit after decimal if needed
	formatted = formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');

	// If it's now just an integer with a period, remove the period
	if (formatted.endsWith('.')) {
		formatted = formatted.slice(0, -1);
	}

	// Handle negative numbers
	if (numValue < 0) {
		formatted = `-${formatted}`;
	}

	return formatted + suffix;
}

interface TreasuryDetailsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	data: ITreasuryStats;
}

interface TokenValueDisplayProps {
	icon: StaticImageData;
	value: string;
	symbol: string;
	showExternalLink?: boolean;
	externalLinkUrl?: string;
}

function TokenValueDisplay({ icon, value, symbol, showExternalLink, externalLinkUrl }: TokenValueDisplayProps) {
	const numValue = parseFloat(value);
	const formatted = formatUSDWithUnits(numValue);

	return (
		<div className='flex items-center gap-2'>
			<Image
				src={icon}
				alt={symbol}
				width={20}
				height={20}
			/>
			<Tooltip title={numValue.toString()}>
				<span className='text-slate-500'>
					{formatted} {symbol}
				</span>
			</Tooltip>
			{showExternalLink &&
				(externalLinkUrl ? (
					<Link
						href={externalLinkUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='text-blue-500 transition-colors hover:text-blue-700'
					>
						<HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
					</Link>
				) : (
					<HiOutlineExternalLink className='h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-700' />
				))}
		</div>
	);
}

// Helper functions for treasury calculations
const formatTreasuryValues = (data: ITreasuryStats) => {
	// Helper functions for formatting with corrected divisors
	const getExactDot = (dotAmount: string): number => {
		if (!dotAmount) return 0;
		return Number(dotAmount) / 1e10;
	};

	const getExactTokenAmount = (amount: string, divisor: number = 1e6): number => {
		if (!amount) return 0;
		return Number(amount) / divisor;
	};

	const formatDotToUsd = (dotAmount: string): string => {
		if (!dotAmount || !data?.nativeTokenUsdPrice) return '0';
		const dot = Number(dotAmount) / 1e10;
		const usdValue = dot * Number(data.nativeTokenUsdPrice);
		return formatUSDWithUnits(usdValue);
	};

	const getExactDotToUsd = (dotAmount: string): string => {
		if (!dotAmount || !data?.nativeTokenUsdPrice) return '0';
		const dot = Number(dotAmount) / 1e10;
		return (dot * Number(data.nativeTokenUsdPrice)).toString();
	};

	// Calculate USD values
	const relayChainUsd = formatDotToUsd(data?.relayChain?.dot || '0');
	const assetHubUsd = formatDotToUsd(data?.assetHub?.dot || '0');
	const hydrationUsd = formatDotToUsd(data?.hydration?.dot || '0');
	const bountiesUsd = formatDotToUsd(data?.bounties?.dot || '0');
	const ambassadorUsd = formatDotToUsd(data?.ambassador?.dot || '0');
	const fellowshipUsd = formatDotToUsd(data?.fellowship?.dot || '0');
	const loansUsd = formatDotToUsd(data?.loans?.dot || '0');

	// Calculate exact USD values for tooltips
	const exactRelayChainUsd = getExactDotToUsd(data?.relayChain?.dot || '0');
	const exactAssetHubUsd = getExactDotToUsd(data?.assetHub?.dot || '0');
	const exactHydrationUsd = getExactDotToUsd(data?.hydration?.dot || '0');
	const exactBountiesUsd = getExactDotToUsd(data?.bounties?.dot || '0');
	const exactAmbassadorUsd = getExactDotToUsd(data?.ambassador?.dot || '0');
	const exactFellowshipUsd = getExactDotToUsd(data?.fellowship?.dot || '0');
	const exactLoansUsd = getExactDotToUsd(data?.loans?.dot || '0');

	// Get token amounts
	const relayChainDot = getExactDot(data?.relayChain?.dot || '0');
	const assetHubDot = getExactDot(data?.assetHub?.dot || '0');
	const assetHubUsdc = data?.assetHub?.usdc ? getExactTokenAmount(data.assetHub.usdc) : 0;
	const assetHubUsdt = data?.assetHub?.usdt ? getExactTokenAmount(data.assetHub.usdt) : 0;
	const hydrationDot = getExactDot(data?.hydration?.dot || '0');
	const hydrationUsdc = data?.hydration?.usdc ? getExactTokenAmount(data.hydration.usdc) : 0;
	const hydrationUsdt = data?.hydration?.usdt ? getExactTokenAmount(data.hydration.usdt) : 0;
	const bountiesDot = getExactDot(data?.bounties?.dot || '0');

	// Special case for ambassador (could be DOT or USDT)
	const ambassadorValue = data?.ambassador?.dot ? getExactDot(data.ambassador.dot) : data?.ambassador?.usdt ? getExactTokenAmount(data.ambassador.usdt) : 0;

	const fellowshipDot = getExactDot(data?.fellowship?.dot || '0');
	const fellowshipUsdt = data?.fellowship?.usdt ? getExactTokenAmount(data.fellowship.usdt) : 0;

	return {
		// USD Values
		relayChainUsd,
		assetHubUsd,
		hydrationUsd,
		bountiesUsd,
		ambassadorUsd,
		fellowshipUsd,
		loansUsd,

		// Exact USD Values
		exactRelayChainUsd,
		exactAssetHubUsd,
		exactHydrationUsd,
		exactBountiesUsd,
		exactAmbassadorUsd,
		exactFellowshipUsd,
		exactLoansUsd,

		// Token amounts
		relayChainDot,
		assetHubDot,
		assetHubUsdc,
		assetHubUsdt,
		hydrationDot,
		hydrationUsdc,
		hydrationUsdt,
		bountiesDot,
		ambassadorValue,
		fellowshipDot,
		fellowshipUsdt,

		// Helper functions
		getExactDot
	};
};

// Render different sections of the dialog to reduce complexity
const renderNetworkSection = (data: ITreasuryStats, treasury: ReturnType<typeof formatTreasuryValues>) => {
	return (
		<div className='space-y-6'>
			{/* Relay Chain */}
			<div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Image
							src={RelayIcon}
							alt='Relay Chain'
							width={24}
							height={24}
						/>
						<span className='text-lg text-slate-800'>Relay Chain</span>
					</div>
					<Tooltip title={`$${treasury.exactRelayChainUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.relayChainUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex items-center gap-2 pl-8'>
					<TokenValueDisplay
						icon={DotIcon}
						value={String(treasury.relayChainDot)}
						symbol='DOT'
					/>
				</div>
			</div>

			{/* Asset Hub */}
			<div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Image
							src={AssetHubIcon}
							alt='Asset Hub'
							width={24}
							height={24}
						/>
						<span className='text-lg text-slate-800'>Asset Hub</span>
					</div>
					<Tooltip title={`$${treasury.exactAssetHubUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.assetHubUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex flex-wrap items-center gap-x-6 pl-8'>
					<TokenValueDisplay
						icon={DotIcon}
						value={String(treasury.assetHubDot)}
						symbol='DOT'
					/>
					{data.assetHub?.usdc && (
						<TokenValueDisplay
							icon={UsdcIcon}
							value={String(treasury.assetHubUsdc)}
							symbol='USDC'
						/>
					)}
					{data.assetHub?.usdt && (
						<TokenValueDisplay
							icon={UsdtIcon}
							value={String(treasury.assetHubUsdt)}
							symbol='USDt'
							showExternalLink
							externalLinkUrl='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
						/>
					)}
				</div>
			</div>

			{/* Hydration */}
			<div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Image
							src={HydrationIcon}
							alt='Hydration'
							width={24}
							height={24}
						/>
						<span className='text-lg text-slate-800'>Hydration</span>
					</div>
					<Tooltip title={`$${treasury.exactHydrationUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.hydrationUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex flex-wrap items-center gap-x-6 pl-8'>
					<TokenValueDisplay
						icon={DotIcon}
						value={String(treasury.hydrationDot)}
						symbol='DOT'
					/>
					{data.hydration?.usdc && (
						<TokenValueDisplay
							icon={UsdcIcon}
							value={String(treasury.hydrationUsdc)}
							symbol='USDC'
						/>
					)}
					{data.hydration?.usdt && (
						<div className='flex items-center gap-2'>
							<TokenValueDisplay
								icon={UsdtIcon}
								value={String(treasury.hydrationUsdt)}
								symbol='USDt'
							/>
							<Link
								href='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
								className='text-pink-500 transition-colors hover:text-pink-700'
								target='_blank'
								rel='noopener noreferrer'
							>
								Address #1
							</Link>
							<Link
								href='https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'
								className='text-pink-500 transition-colors hover:text-pink-700'
								target='_blank'
								rel='noopener noreferrer'
							>
								Address #2
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const renderOtherSections = (data: ITreasuryStats, treasury: ReturnType<typeof formatTreasuryValues>) => {
	return (
		<div className='space-y-6'>
			{/* Bounties */}
			<div>
				<div className='flex items-center justify-between'>
					<span className='text-lg text-slate-800'>Bounties</span>
					<Tooltip title={`$${treasury.exactBountiesUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.bountiesUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex items-center gap-2 pl-8'>
					<TokenValueDisplay
						icon={DotIcon}
						value={String(treasury.bountiesDot)}
						symbol='DOT'
						showExternalLink
						externalLinkUrl='https://polkadot.polkassembly.io/bounty-dashboard'
					/>
				</div>
			</div>

			{/* Ambassador */}
			<div>
				<div className='flex items-center justify-between'>
					<span className='text-lg text-slate-800'>Ambassador</span>
					<Tooltip title={`$${treasury.exactAmbassadorUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.ambassadorUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex items-center gap-2 pl-8'>
					<TokenValueDisplay
						icon={DotIcon}
						value={String(treasury.ambassadorValue)}
						symbol='DOT'
						showExternalLink
						externalLinkUrl='https://assethub-polkadot.subscan.io/account/13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'
					/>
				</div>
			</div>

			{/* Fellowships */}
			<div>
				<div className='flex items-center justify-between'>
					<span className='text-lg text-slate-800'>Fellowships</span>
					<Tooltip title={`$${treasury.exactFellowshipUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.fellowshipUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex flex-wrap items-center gap-x-6 pl-8'>
					<div className='flex items-center gap-2'>
						<Link
							href='https://assethub-polkadot.subscan.io/account/16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'
							className='text-pink-500 transition-colors hover:text-pink-700'
							target='_blank'
							rel='noopener noreferrer'
						>
							Treasury
						</Link>
						<TokenValueDisplay
							icon={DotIcon}
							value={String(treasury.fellowshipDot)}
							symbol='DOT'
						/>
						<Link
							href='https://assethub-polkadot.subscan.io/account/13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'
							className='text-pink-500 transition-colors hover:text-pink-700'
							target='_blank'
							rel='noopener noreferrer'
						>
							Salary
						</Link>
					</div>
					{data.fellowship?.usdt && (
						<TokenValueDisplay
							icon={UsdtIcon}
							value={String(treasury.fellowshipUsdt)}
							symbol='USDt'
						/>
					)}
				</div>
			</div>

			{/* Loans */}
			<div>
				<div className='flex items-center justify-between'>
					<span className='text-lg text-slate-800'>Loans</span>
					<Tooltip title={`$${treasury.exactLoansUsd}`}>
						<span className='text-lg text-slate-800'>~ ${treasury.loansUsd}</span>
					</Tooltip>
				</div>
				<div className='mt-1 flex flex-wrap items-center gap-x-2 pl-8'>
					<Link
						href='https://polkadot.polkassembly.io/referenda/432'
						className='text-pink-500 transition-colors hover:text-pink-700'
						target='_blank'
						rel='noopener noreferrer'
					>
						Bifrost
					</Link>
					<Image
						src={DotIcon}
						alt='DOT'
						width={20}
						height={20}
					/>
					<Tooltip title='500000'>
						<span className='text-slate-500'>500.0K DOT</span>
					</Tooltip>
					<Link
						href='https://polkadot.polkassembly.io/referenda/748'
						className='text-pink-500 transition-colors hover:text-pink-700'
						target='_blank'
						rel='noopener noreferrer'
					>
						Pendulum
					</Link>
					<Image
						src={DotIcon}
						alt='DOT'
						width={20}
						height={20}
					/>
					<Tooltip title='50000'>
						<span className='text-slate-500'>50.0K DOT</span>
					</Tooltip>
					<Link
						href='https://polkadot.polkassembly.io/referenda/560'
						className='text-pink-500 transition-colors hover:text-pink-700'
						target='_blank'
						rel='noopener noreferrer'
					>
						Hydration
					</Link>
					<Image
						src={DotIcon}
						alt='DOT'
						width={20}
						height={20}
					/>
					<Tooltip title='1000000'>
						<span className='text-slate-500'>1M DOT</span>
					</Tooltip>
					<Link
						href='https://polkadot.polkassembly.io/referenda/1122'
						className='text-pink-500 transition-colors hover:text-pink-700'
						target='_blank'
						rel='noopener noreferrer'
					>
						Centrifuge
					</Link>
					{data.loans?.usdc && (
						<>
							<Image
								src={UsdcIcon}
								alt='USDC'
								width={20}
								height={20}
							/>
							<Tooltip title='1500000'>
								<span className='text-slate-500'>1.5M USDC</span>
							</Tooltip>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export function TreasuryDetailsDialog({ isOpen, onClose, data }: TreasuryDetailsDialogProps): JSX.Element {
	// Check if data exists
	const isDataLoaded = !!data;

	// Calculate all treasury values if data is loaded
	const treasury = isDataLoaded ? formatTreasuryValues(data) : null;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={() => onClose()}
		>
			<DialogContent className='max-w-2xl bg-bg_modal p-6'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-medium text-slate-800'>Treasury Distribution</DialogTitle>
				</DialogHeader>

				{!isDataLoaded ? (
					<div className='py-8 text-center'>Loading treasury data...</div>
				) : (
					<div className='py-4'>
						<h2 className='mb-4 text-slate-500'>Across Networks:</h2>

						{/* Network section */}
						{renderNetworkSection(data, treasury!)}

						<div className='my-6 border-t border-gray-200' />

						{/* Other sections (Bounties, Ambassador, etc.) */}
						{renderOtherSections(data, treasury!)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
