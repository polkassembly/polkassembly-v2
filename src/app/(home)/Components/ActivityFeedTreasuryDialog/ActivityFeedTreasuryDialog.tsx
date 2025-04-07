// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import RelayIcon from '@assets/icons/relay-chain-icon.svg';
import AssetHubIcon from '@assets/icons/asset-hub-icon.svg';
import HydrationIcon from '@assets/icons/hydration-icon.svg';
import DotIcon from '@assets/icons/dot.png';
import UsdtIcon from '@assets/icons/usdt.svg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Link from 'next/link';
import { ReactElement } from 'react';
import { ITreasuryStats } from '@/_shared/types';
import { Separator } from '@/app/_shared-components/Separator';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatTreasuryValues } from '@/app/_client-utils/getTreasuryNetworkStats';
import TokenValueDisplay from './Components/TokenValueDisplay';
import NetworkSection from './Components/NetworkSection';
import LoansSection from './Components/LoanSection';

interface TreasuryDetailsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	data: ITreasuryStats;
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

export function TreasuryDetailsDialog({ isOpen, onClose, data }: TreasuryDetailsDialogProps): ReactElement {
	const isDataLoaded = !!data;
	const t = useTranslations('ActivityFeed');
	const treasury = formatTreasuryValues(data);
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
						<div>
							<NetworkSection
								title={t('relayChain')}
								icon={RelayIcon}
								usdValue={treasury?.relayChainUsd || '0'}
								dotValue={treasury?.relayChainDot || 0}
							/>
							<NetworkSection
								title={t('assetHub')}
								icon={AssetHubIcon}
								usdValue={treasury?.assetHubUsd || '0'}
								dotValue={treasury?.assetHubDot || 0}
								usdcValue={treasury?.assetHubUsdc || 0}
								usdtValue={treasury?.assetHubUsdt || 0}
								usdtExternalLink='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
							/>
							<NetworkSection
								title={t('hydration')}
								icon={HydrationIcon}
								usdValue={treasury?.hydrationUsd || '0'}
								dotValue={treasury?.hydrationDot || 0}
								usdcValue={treasury?.hydrationUsdc || 0}
								usdtValue={treasury?.hydrationUsdt || 0}
								usdtExternalLink='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
								secondUsdtExternalLink='https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'
							/>
						</div>
						<div className='my-4 border-t border-border_grey' />
						<div>
							<OtherSection
								title={t('bounties')}
								usdValue={treasury?.bountiesUsd || '0'}
								dotValue={treasury?.bountiesDot || 0}
								externalLink='https://polkadot.polkassembly.io/bounty-dashboard'
							/>
							<OtherSection
								title={t('ambassador')}
								usdValue={String(formatUSDWithUnits(treasury?.ambassadorValue?.toString() || '0'))}
								dotValue={treasury?.ambassadorValue || 0}
								externalLink='https://assethub-polkadot.subscan.io/account/13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'
							/>
							<OtherSection
								title={t('fellowships')}
								usdValue={treasury?.fellowshipUsd || '0'}
								dotValue={treasury?.fellowshipDot || 0}
								fellowshipUsdt={treasury?.fellowshipUsdt || 0}
							/>
							<LoansSection data={data} />
						</div>{' '}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
