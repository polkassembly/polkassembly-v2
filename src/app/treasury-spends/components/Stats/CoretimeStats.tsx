// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Image from 'next/image';
import TotalSpent from '@assets/analytics/total-spent.svg';
import ApprovedProposals from '@assets/analytics/approved-proposals.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
// import { useTranslations } from 'next-intl';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { MdSort } from '@react-icons/all-files/md/MdSort';

function CoretimeStats() {
	// const t = useTranslations();
	const network = getCurrentNetwork();

	const data = { currentCorePrice: 1230000000000000000, coreUtilization: '89%', revenueBurned: 1230000000000000000, nextSale: 'In 3 days' };

	return (
		<div className='flex w-full flex-col gap-4 rounded-xl border border-border_grey bg-bg_modal p-4 md:flex-row md:items-center md:justify-between md:gap-6 lg:gap-12'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6 lg:gap-12'>
				<div className='flex items-center gap-x-2'>
					<Image
						src={TotalSpent}
						alt='Total Spent'
						width={50}
						height={50}
						className='h-[50px] w-[50px]'
					/>
					<div className='flex flex-col gap-y-1'>
						<p className='text-xs text-wallet_btn_text'>Core Utilization</p>
						{!data ? <Skeleton className='h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.coreUtilization}</p>}
					</div>
				</div>
				<Separator
					className='hidden h-12 md:block'
					orientation='vertical'
				/>
				<Separator className='w-full md:hidden' />
				<div className='flex items-center gap-x-2'>
					<Image
						src={ApprovedProposals}
						alt='Approved Proposals'
						width={50}
						height={50}
						className='h-[50px] w-[50px]'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text'>Current Core Prize</p>
						{!data ? (
							<Skeleton className='mb-1 h-4 w-20' />
						) : (
							<p className='text-lg font-semibold text-text_primary'>
								${formatBnBalance(data.currentCorePrice.toString(), { withUnit: false, numberAfterComma: 2, compactNotation: true }, network, null)}
							</p>
						)}
					</div>
				</div>
				<Separator
					className='hidden h-12 md:block'
					orientation='vertical'
				/>
				<Separator className='w-full md:hidden' />
				<div className='flex items-center gap-x-2'>
					<Image
						src={ApprovedProposals}
						alt='Approved Proposals'
						width={50}
						height={50}
						className='h-[50px] w-[50px]'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text'>Revenue Burned</p>
						{!data ? (
							<Skeleton className='mb-1 h-4 w-20' />
						) : (
							<p className='text-lg font-semibold text-text_primary'>
								${formatBnBalance(data.revenueBurned.toString(), { withUnit: false, numberAfterComma: 2, compactNotation: true }, network, null)}
							</p>
						)}
					</div>
				</div>
				<Separator
					className='hidden h-12 md:block'
					orientation='vertical'
				/>
				<Separator className='w-full md:hidden' />
				<div className='flex items-center gap-x-2'>
					<Image
						src={ApprovedProposals}
						alt='Approved Proposals'
						width={50}
						height={50}
						className='h-[50px] w-[50px]'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text'>Next Sale</p>
						{!data ? <Skeleton className='mb-1 h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.nextSale}</p>}
					</div>
				</div>
			</div>
			<div className='flex items-center gap-x-2'>
				<button
					type='button'
					className='bg-bg_card !size-9 rounded-lg border border-primary_border p-2 hover:text-text_primary'
					title='Filter'
				>
					<FaFilter className='text-lg text-basic_text' />
				</button>
				<button
					type='button'
					className='bg-bg_card !size-9 rounded-lg border border-primary_border p-1.5 hover:text-text_primary'
					title='Menu'
				>
					<MdSort className='text-2xl text-basic_text' />
				</button>
			</div>
		</div>
	);
}
export default CoretimeStats;
