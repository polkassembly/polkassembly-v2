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
import { ENetwork, IBountyStats } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';

function StatItem({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex flex-col'>
			<span className='font-pixelify text-[18px] font-semibold leading-none text-[#2D2D2D] dark:text-[#737373]'>{label}</span>
			<span className='font-pixeboy text-[28px] font-medium'>{value}</span>
		</div>
	);
}

function BountyHeader({ bountiesStats, tokenPrice }: { bountiesStats: IBountyStats; tokenPrice: number }) {
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [bountyAmount, setBountyAmount] = useState<string>('0');

	useEffect(() => {
		apiService?.getBountyAmount().then((amount) => {
			setBountyAmount(amount);
		});
	}, [apiService]);

	const availableBounty = !isNaN(Number(tokenPrice)) ? formatUSDWithUnits(String(Number(bountyAmount) * Number(tokenPrice)), 2) : '$0.00';

	return (
		<div className='dark:bg-section-dark-overlay mt-4 rounded-3xl bg-bg_modal p-5 md:p-6'>
			<div className='flex'>
				<div className='hidden gap-6 lg:flex'>
					<div>
						<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
						<div className='leading-none'>
							<span className='font-pixeboy text-[46px] leading-none'>${availableBounty}</span>
							<span className={`ml-2 text-[22px] font-medium leading-none ${spaceGroteskFont.className}`}>~ {formatUSDWithUnits(bountyAmount, 2)}</span>
							<span className={`${spaceGroteskFont.className} ml-1 text-[22px] font-medium leading-none`}>DOT</span>
						</div>
						<div className='-mb-6 -ml-6 mt-4 flex h-[185px] w-[360px] items-end rounded-bl-3xl rounded-tr-[125px] bg-btn_primary_background xl:w-[380px] 2xl:w-[380px]'>
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
							label='Active Bounties'
							value={bountiesStats.activeBounties}
						/>
						<StatItem
							label='Claimants'
							value={bountiesStats.peopleEarned}
						/>
						<StatItem
							label='Total Rewarded'
							value={formatTokenValue(bountiesStats.totalRewarded, network, { isLoading: false, value: tokenPrice.toString() }, NETWORKS_DETAILS[network as ENetwork].tokenSymbol)}
						/>
						<StatItem
							label='Total Bounty Pool'
							value={formatTokenValue(
								bountiesStats.totalBountyPool,
								network,
								{ isLoading: false, value: tokenPrice.toString() },
								NETWORKS_DETAILS[network as ENetwork].tokenSymbol
							)}
						/>
					</div>
				</div>

				<div className='items-between relative hidden h-full flex-col justify-between lg:flex'>
					<span className='absolute -top-6 left-1/2 h-10 w-20 rotate-180 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
					<Image
						src={DashedLineIcon}
						alt='bounty icon'
						className='ml-16 mt-6'
						width={3}
						height={209}
					/>
					<span className='absolute left-1/2 top-[237px] h-10 w-20 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
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
						<span className='font-pixelify text-base text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
						<div className='font-pixeboy text-[46px]'>~500 USDT</div>
						<div className='grid grid-cols-2 gap-y-8 py-7 pr-4'>
							<StatItem
								label='Active Bounties'
								value='10'
							/>
							<StatItem
								label='No. of People Earned'
								value='10'
							/>
							<StatItem
								label='Total Rewarded'
								value='10'
							/>
							<StatItem
								label='Total Bounty Pool'
								value='10'
							/>
						</div>
						<div className='items-between relative -ml-6 flex items-center justify-between'>
							<span className='left-0 h-20 w-10 rounded-r-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
							<Image
								src={DashedLineIcon}
								alt='bounty icon'
								className='h-56 w-auto rotate-90'
								width={209}
								height={3}
							/>
							<span className='first-letter right-0 h-20 w-10 rounded-l-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
						</div>
						<div className='-ml-4 flex w-full flex-col items-center gap-x-4'>
							<Image
								src={BountyCreateMbWhiteIcon}
								alt='bounty icon'
								className='w-49 hidden h-10 scale-125 dark:block'
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
						<div className='-mb-6 -ml-6 mt-4 flex h-[185px] items-end rounded-bl-3xl rounded-tr-[125px] bg-btn_primary_background'>
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

export default BountyHeader;
