// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Image from 'next/image';
import TotalMembers from '@assets/icons/total-members.svg';
import VerifiedMembers from '@assets/icons/verified-members.svg';
import { useTranslations } from 'next-intl';

interface CuratorStatsProps {
	totalMembers: number;
	verifiedMembers: number;
}

function CuratorStats({ totalMembers, verifiedMembers }: CuratorStatsProps) {
	const t = useTranslations('Community.Members');

	return (
		<div className='flex w-full flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4 md:flex-row md:items-center md:gap-6 lg:gap-x-12'>
			<div className='flex items-center gap-x-2'>
				<Image
					src={TotalMembers}
					alt='Total Members'
					width={44}
					height={44}
					className='h-[44px] w-[44px]'
				/>
				<div className='flex flex-col gap-y-1'>
					<p className='text-xs text-wallet_btn_text'>{t('totalMembers')}</p>
					{!totalMembers ? <Skeleton className='h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{totalMembers}</p>}
				</div>
			</div>
			<Separator
				className='hidden h-10 md:block'
				orientation='vertical'
			/>
			<Separator className='w-full md:hidden' />
			<div className='flex items-center gap-x-2'>
				<Image
					src={VerifiedMembers}
					alt='Verified Members'
					width={44}
					height={44}
					className='h-[44px] w-[44px]'
				/>
				<div className='flex flex-col'>
					<p className='text-xs text-wallet_btn_text'>{t('verifiedMembers')}</p>
					{!verifiedMembers ? <Skeleton className='mb-1 h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{verifiedMembers}</p>}
				</div>
			</div>
		</div>
	);
}
export default CuratorStats;
