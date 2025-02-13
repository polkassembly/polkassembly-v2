// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import Image from 'next/image';
import ProposalIcon from '@assets/icons/proposal.svg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import BountyTable from './BountyTable';
import styles from './Bounties.module.scss';

enum EBountyStatus {
	All = 'all',
	Active = 'Active',
	Proposed = 'Proposed',
	Claimed = 'Claimed',
	Cancelled = 'Cancelled',
	Rejected = 'Rejected'
}

const STATUS_DISPLAY_NAMES: Record<EBountyStatus, string> = {
	[EBountyStatus.All]: 'All',
	[EBountyStatus.Active]: 'Active',
	[EBountyStatus.Proposed]: 'Proposed',
	[EBountyStatus.Claimed]: 'Claimed',
	[EBountyStatus.Cancelled]: 'Cancelled',
	[EBountyStatus.Rejected]: 'Rejected'
};

function BountiesListingPage({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pageParam = searchParams.get('page')?.split('?')[0];
	const page = parseInt(pageParam || '1', 10);
	const status = searchParams.get('status') || 'all';
	const t = useTranslations();

	const statusValues = Object.values(EBountyStatus);

	const handleTabChange = (value: string) => {
		if (!Object.values(EBountyStatus).includes(value as EBountyStatus)) {
			return;
		}
		const params = new URLSearchParams();
		params.set('page', '1');
		params.set('status', value);
		router.push(`/bounties-listing?${params.toString()}`);
	};

	return (
		<div>
			<div className='flex items-center justify-between'>
				<span className='text-[32px] font-bold text-btn_secondary_text'>On-chain Bounties</span>
				<div className='flex gap-2'>
					<button
						type='button'
						className='flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[14px] border-none bg-gradient-to-b from-[#FF50AD] via-[#E5007A] to-[#E5007A] px-[22px] py-[11px] md:w-auto md:justify-normal'
					>
						<Image
							src={ProposalIcon}
							alt='bounty icon'
							className='h-4 w-4'
							width={15}
							height={15}
						/>
						<span className='font-bold text-white'>Create Bounty Proposal</span>
					</button>
				</div>
			</div>
			<Tabs
				onValueChange={handleTabChange}
				defaultValue={status}
			>
				<TabsList className='mb-4 flex w-full justify-start border-border_grey dark:border-b'>
					{statusValues.map((statusValue) => (
						<TabsTrigger
							key={statusValue}
							className='m-0 p-2 px-4 text-input_text data-[state=active]:rounded-t-lg data-[state=active]:dark:bg-bg_modal'
							value={statusValue}
						>
							{STATUS_DISPLAY_NAMES[statusValue]}
						</TabsTrigger>
					))}
				</TabsList>

				{statusValues.map((statusValue) => (
					<TabsContent
						key={statusValue}
						value={statusValue}
					>
						{initialData.totalCount > 1 ? <BountyTable filteredItems={initialData?.items} /> : <p className={styles.no_data}>{t('CreateProposalDropdownButton.noData')}</p>}
					</TabsContent>
				))}

				{initialData.totalCount > DEFAULT_LISTING_LIMIT && (
					<div className='mt-4'>
						<PaginationWithLinks
							page={Number(page)}
							pageSize={DEFAULT_LISTING_LIMIT}
							totalCount={initialData?.totalCount || 0}
							onClick={(pageNumber) => {
								const params = new URLSearchParams(searchParams.toString());
								params.set('page', pageNumber.toString());
								router.push(`/bounties-listing?${params.toString()}`);
							}}
						/>
					</div>
				)}
			</Tabs>
		</div>
	);
}

export default BountiesListingPage;
