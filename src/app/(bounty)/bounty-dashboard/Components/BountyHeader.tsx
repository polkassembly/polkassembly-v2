// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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

function StatItem({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex flex-col'>
			<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>{label}</span>
			<span className='font-pixeboy text-[28px] font-medium'>{value}</span>
		</div>
	);
}

function BountyHeader() {
	return (
		<div className='dark:bg-section-dark-overlay mt-4 rounded-3xl bg-white p-5 md:p-6'>
			<div className='flex'>
				<div className='hidden gap-6 md:flex'>
					<div>
						<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
						<div className='font-pixeboy text-[46px]'>
							<span className='ml-2 text-[22px] font-medium'>~500</span>
							<span className='ml-1 text-[22px] font-medium'>USDT</span>
						</div>
						<div className='-mb-6 -ml-6 mt-4 flex h-[185px] w-[420px] items-end rounded-bl-3xl rounded-tr-[125px] bg-btn_primary_background'>
							<div className='mb-8 ml-6 flex items-end gap-3'>
								<Image
									src={BountyIcon}
									alt='bounty icon'
									width={308}
									height={113}
								/>
								<Image
									src={BountyArrowIcon}
									alt='arrow icon'
									width={50}
									height={50}
								/>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-x-24 py-7'>
						<StatItem
							label='Active Bounties'
							value='10'
						/>
						<StatItem
							label='Claimants'
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
				</div>

				<div className='items-between relative hidden h-full flex-col justify-between md:flex'>
					<span className='absolute -top-6 left-1/2 h-10 w-20 rotate-180 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
					<Image
						src={DashedLineIcon}
						alt='bounty icon'
						className='ml-[38px] mt-6'
						width={3}
						height={209}
					/>
					<span className='absolute left-1/2 top-[237px] h-10 w-20 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
				</div>

				<div className='hidden gap-x-10 md:flex'>
					<Image
						src={BountyCreateWhiteIcon}
						alt='bounty icon'
						className='ml-32 mt-6 hidden h-[69px] dark:block'
						width={100}
						height={100}
					/>
					<Image
						src={BountyCreateIcon}
						alt='bounty icon'
						className='ml-32 mt-6 block h-[69px] dark:hidden'
						width={100}
						height={100}
					/>
					<Image
						src={BountyBarcodeWhiteIcon}
						alt='bounty icon'
						className='mt-6 hidden h-[24px] dark:block'
						width={24}
						height={24}
					/>
					<Image
						src={BountyBarcodeIcon}
						alt='bounty icon'
						className='mt-6 block h-[24px] dark:hidden'
						width={24}
						height={24}
					/>
				</div>
				<div className='flex flex-col gap-6 md:hidden'>
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
								className='h-[3px] w-[209px]'
								width={209}
								height={3}
							/>
							<span className='first-letter right-0 h-20 w-10 rounded-l-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]' />
						</div>
						<div className='-ml-4 mt-12 flex w-full flex-col items-center gap-x-4'>
							<Image
								src={BountyCreateMbWhiteIcon}
								alt='bounty icon'
								className='hidden h-[24px] w-auto scale-125 dark:block'
								width={100}
								height={100}
							/>
							<Image
								src={BountyCreateMbIcon}
								alt='bounty icon'
								className='block h-[24px] w-auto scale-125 dark:hidden'
								width={100}
								height={100}
							/>

							<Image
								src={BountyBarcodeMbWhiteIcon}
								alt='bounty icon'
								className='mt-6 hidden h-[24px] scale-125 dark:block'
								width={24}
								height={24}
							/>
							<Image
								src={BountyBarcodeMbIcon}
								alt='bounty icon'
								className='mt-6 block h-[24px] scale-125 dark:hidden'
								width={24}
								height={24}
							/>
						</div>
						<div className='-mb-6 -ml-6 mt-4 flex h-[185px] items-end rounded-bl-3xl rounded-tr-[125px] bg-btn_primary_background'>
							<div className='mb-8 flex items-end gap-3'>
								<Image
									src={BountyIcon}
									alt='bounty icon'
									className='h-[113px] w-[308px] scale-90'
									width={308}
									height={113}
								/>
								<Image
									src={BountyArrowIcon}
									alt='arrow icon'
									className='pr-2'
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
