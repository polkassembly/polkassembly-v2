// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import BountyIcon from '@assets/bounties/bounty-icon.svg';
import BountyArrowIcon from '@assets/bounties/bounty-arrow-icon.svg';
import BountyBarcodeIcon from '@assets/bounties/bounty-barcode.svg';
import BountyCreateIcon from '@assets/bounties/create.svg';
import BountyCreateWhiteIcon from '@assets/bounties/create-white.svg';
import BountyBarcodeWhiteIcon from '@assets/bounties/barcode-white.svg';
import BountyCreateMbIcon from '@assets/bounties/create-mb.svg';
import BountyBarcodeMbIcon from '@assets/bounties/barcode-mb.svg';
import BountyCreateMbWhiteIcon from '@assets/bounties/create-mb-white.svg';
import BountyBarcodeMbWhiteIcon from '@assets/bounties/barcode-mb-white.svg';
import DashedLineIcon from '@assets/bounties/dashed-line.svg';
import { spaceGroteskFont } from '@/app/_style/fonts';
import { IBountyStats } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import styles from './Bounty.module.scss';

function StatItem({ label, value }: { label: string; value: string | undefined }) {
	return (
		<div className='flex flex-col'>
			<span className={styles.bounty_stats_label}>{label}</span>
			{value ? <span className='font-pixeboy text-[28px] font-medium'>{value}</span> : null}
		</div>
	);
}

function BountyStats({ bountiesStats, tokenPrice, totalBountyPool }: { bountiesStats: IBountyStats; tokenPrice: number; totalBountyPool?: string }) {
	const network = getCurrentNetwork();
	const t = useTranslations('Bounty');

	return (
		<div className='mt-4 rounded-3xl bg-bg_modal p-5 md:p-6'>
			<div className='flex'>
				<div className='hidden gap-6 lg:flex'>
					<div>
						<span className={styles.bounty_dash_available_bounty_pool}>{t('availableBountyPool')}</span>
						<div className='leading-none'>
							{totalBountyPool && <span className='font-pixeboy text-[46px] leading-none'>{formatTokenValue(totalBountyPool, network, tokenPrice)}</span>}
							{totalBountyPool && (
								<span className={`ml-2 text-[22px] font-medium leading-none ${spaceGroteskFont.className}`}>
									~ {formatBnBalance(totalBountyPool, { withUnit: true, compactNotation: true, numberAfterComma: 2 }, network)}
								</span>
							)}
						</div>
						<div className={styles.bounty_dash_available_bounty_pool_left_bg}>
							<div className='mb-8 ml-1 flex items-end gap-3'>
								<Image
									src={BountyIcon}
									alt='bounty icon'
									className='h-32 w-64 scale-90 xl:h-[103px] xl:w-[308px]'
									width={308}
									height={113}
								/>
								<Image
									src={BountyArrowIcon}
									alt='arrow icon'
									className='w-20 pr-2'
									width={100}
									height={100}
								/>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-x-24 py-7'>
						<StatItem
							label={t('activeBounties')}
							value={bountiesStats.activeBounties ? String(bountiesStats.activeBounties) : undefined}
						/>
						<StatItem
							label={t('claimants')}
							value={bountiesStats.peopleEarned ? String(bountiesStats.peopleEarned) : undefined}
						/>
						<StatItem
							label={t('totalRewarded')}
							value={bountiesStats.totalRewarded ? formatTokenValue(bountiesStats.totalRewarded, network, tokenPrice, NETWORKS_DETAILS[`${network}`].tokenSymbol) : undefined}
						/>
						<StatItem
							label={t('totalBountyPool')}
							value={bountiesStats.totalBountyPool ? formatTokenValue(bountiesStats.totalBountyPool, network, tokenPrice, NETWORKS_DETAILS[`${network}`].tokenSymbol) : undefined}
						/>
					</div>
				</div>

				<div className={styles.bounty_dash_available_bounty_pool_right_bg}>
					<span className={styles.bounty_dash_available_bounty_pool_right_bg_line} />
					<Image
						src={DashedLineIcon}
						alt='bounty icon'
						className='ml-16 mt-6'
						width={3}
						height={209}
					/>
					<span className={styles.bounty_dash_available_bounty_pool_right_bg_line_2} />
				</div>

				<div className='hidden gap-x-10 lg:flex'>
					<Image
						src={BountyCreateWhiteIcon}
						alt='bounty icon'
						className='ml-5 mt-6 hidden h-52 dark:block xl:ml-20'
						width={100}
						height={100}
					/>
					<Image
						src={BountyCreateIcon}
						alt='bounty icon'
						className='ml-5 mt-6 block h-52 dark:hidden xl:ml-20'
						width={100}
						height={100}
					/>
					<Image
						src={BountyBarcodeWhiteIcon}
						alt='bounty icon'
						className='ml-5 mt-6 hidden h-52 w-auto dark:block'
						width={24}
						height={24}
					/>
					<Image
						src={BountyBarcodeIcon}
						alt='bounty icon'
						className='ml-5 mt-6 block h-52 w-auto dark:hidden'
						width={24}
						height={24}
					/>
				</div>
				<div className='flex flex-col gap-6 lg:hidden'>
					<div>
						<span className='font-pixelify text-base text-bounty_pool_text'>{t('availableBountyPool')}</span>
						<div className='leading-none'>
							{totalBountyPool && <span className='font-pixeboy text-[46px] leading-none'>{formatTokenValue(totalBountyPool, network, tokenPrice)}</span>}
							{totalBountyPool && (
								<span className={`ml-2 text-[22px] font-medium leading-none ${spaceGroteskFont.className}`}>
									~ {formatBnBalance(totalBountyPool, { withUnit: true, compactNotation: true, numberAfterComma: 2 }, network)}
								</span>
							)}
						</div>
						<div className='grid grid-cols-2 gap-y-8 py-7 pr-4'>
							<StatItem
								label={t('activeBounties')}
								value={bountiesStats.activeBounties ? String(bountiesStats.activeBounties) : undefined}
							/>
							<StatItem
								label={t('claimants')}
								value={bountiesStats.peopleEarned ? String(bountiesStats.peopleEarned) : undefined}
							/>
							<StatItem
								label={t('totalRewarded')}
								value={bountiesStats.totalRewarded ? formatTokenValue(bountiesStats.totalRewarded, network, tokenPrice, NETWORKS_DETAILS[`${network}`].tokenSymbol) : undefined}
							/>
							<StatItem
								label={t('totalBountyPool')}
								value={bountiesStats.totalBountyPool ? formatTokenValue(bountiesStats.totalBountyPool, network, tokenPrice, NETWORKS_DETAILS[`${network}`].tokenSymbol) : undefined}
							/>
						</div>
						<div className='relative -ml-6 flex items-center justify-between'>
							<span className='absolute left-0 top-20 h-10 w-20 rotate-90 rounded-t-full bg-bounty_dash_bg shadow-none' />
							<Image
								src={DashedLineIcon}
								alt='bounty icon'
								className='ml-12 h-52 w-full rotate-90'
								width={430}
								height={20}
							/>
							<span className='right-0 h-20 w-10 rounded-l-full bg-bounty_dash_bg shadow-none' />
						</div>
						<div className='-ml-4 flex w-full flex-col items-center gap-x-4'>
							<Image
								src={BountyCreateMbWhiteIcon}
								alt='bounty icon'
								className='hidden h-10 w-60 scale-125 dark:block'
								width={100}
								height={100}
							/>
							<Image
								src={BountyCreateMbIcon}
								alt='bounty icon'
								className='block h-10 w-60 scale-125 dark:hidden'
								width={100}
								height={100}
							/>

							<Image
								src={BountyBarcodeMbWhiteIcon}
								alt='bounty icon'
								className='mt-6 hidden h-32 w-60 scale-125 dark:block'
								width={24}
								height={24}
							/>
							<Image
								src={BountyBarcodeMbIcon}
								alt='bounty icon'
								className='mt-6 block h-32 w-60 scale-125 dark:hidden'
								width={24}
								height={24}
							/>
						</div>
						<div className={styles.bounty_dash_available_bounty_pool_right_bg_line_3}>
							<div className='mb-8 flex items-end gap-3'>
								<Image
									src={BountyIcon}
									alt='bounty icon'
									className='h-28 w-60 scale-90 sm:h-[113px] sm:w-[308px]'
									width={308}
									height={113}
								/>
								<Image
									src={BountyArrowIcon}
									alt='arrow icon'
									className='w-20 pr-2 sm:w-24'
									width={100}
									height={100}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BountyStats;
