// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useMemo } from 'react';
import { EBountyStatus, EProposalStatus, EProposalStep, EProposalType, IGenericListingResponse, IPostListing } from '@/_shared/types';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useRouter } from 'next/navigation';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { ExternalLink, Plus, SearchIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import BountiesStats from './BountiesStats';
import BountiesGrid from './BountiesGrid';

enum EBountyTab {
	ALL_BOUNTIES = 'ALL_BOUNTIES',
	ANALYTICS = 'ANALYTICS'
}

const convertStatusToStatusesArray = (status: EBountyStatus): EProposalStatus[] => {
	switch (status) {
		case EBountyStatus.ACTIVE:
			return [EProposalStatus.Active, EProposalStatus.Extended];
		case EBountyStatus.CLAIMED:
			return [EProposalStatus.Claimed];
		case EBountyStatus.CANCELLED:
			return [EProposalStatus.Cancelled];
		case EBountyStatus.REJECTED:
			return [EProposalStatus.Rejected];
		case EBountyStatus.PROPOSED:
			return [EProposalStatus.Proposed];
		default:
			return [];
	}
};

function BountiesListingPage({ initialData, status, page }: { initialData: IGenericListingResponse<IPostListing>; status: EBountyStatus; page: number }) {
	const router = useRouter();
	const t = useTranslations();
	const statusValues = Object.values(EBountyStatus);
	const { user } = useUser();
	const [searchQuery, setSearchQuery] = useState('');

	const { data: allBounties } = useQuery({
		queryKey: ['allBounties', status],
		queryFn: async () => {
			const statuses = convertStatusToStatusesArray(status);
			const { data } = await NextApiClientService.fetchListingData({
				proposalType: EProposalType.BOUNTY,
				page: 1,
				limit: MAX_LISTING_LIMIT,
				statuses
			});
			return data;
		},
		enabled: !!searchQuery.trim()
	});

	const filteredData = useMemo(() => {
		if (!searchQuery.trim()) {
			return initialData;
		}

		const dataToFilter = allBounties || initialData;
		const filtered = dataToFilter.items.filter((bounty) => {
			const titleMatch = bounty.title?.toLowerCase().includes(searchQuery.toLowerCase());
			const curatorMatch = bounty.onChainInfo?.curator?.toLowerCase().includes(searchQuery.toLowerCase());
			return titleMatch || curatorMatch;
		});

		return {
			items: filtered,
			totalCount: filtered.length
		};
	}, [initialData, allBounties, searchQuery]);

	const handleTabChange = (value: string) => {
		if (!Object.values(EBountyStatus).includes(value as EBountyStatus)) {
			return;
		}
		const params = new URLSearchParams();
		params.set('page', '1');

		if (value !== EBountyStatus.ALL) {
			params.set('status', value);
		}
		router.push(`/bounties?${params.toString()}`);
	};

	return (
		<Tabs defaultValue={EBountyTab.ALL_BOUNTIES}>
			<div>
				<div className='bg-bg_modal shadow-md'>
					<div className='mx-auto max-w-7xl px-4 pt-8 lg:px-16'>
						<div className='flex flex-col justify-between gap-6 md:flex-row md:items-start'>
							<div className='flex flex-col gap-2'>
								<h1 className='text-2xl font-semibold text-text_primary'>{t('Bounties.onchainBounties')}</h1>
								<p className='text-sm leading-[21px] text-text_primary'>{t('Bounties.description')}</p>
								<Link
									href='https://wiki.polkadot.network/docs/learn-bounties'
									target='_blank'
									className='flex items-center gap-1 text-sm font-medium text-text_pink hover:underline'
								>
									{t('Bounties.readMore')} <ExternalLink size={14} />
								</Link>
							</div>

							<div className='flex gap-3'>
								<Link
									href={user ? `/create?open=${EProposalStep.CREATE_BOUNTY}` : `/login?nextUrl=/create?open=${EProposalStep.CREATE_BOUNTY}`}
									className='flex items-center gap-2 rounded-lg bg-navbar_border px-3 py-1.5 text-sm font-medium text-btn_primary_text'
								>
									<Plus className='h-4 w-4' />
									{t('Bounties.create')}
								</Link>
							</div>
						</div>

						<TabsList className='mt-5 flex flex-nowrap items-center justify-start gap-2 p-0 font-bold'>
							<TabsTrigger
								className='flex-shrink-0 px-3 py-2 text-sm'
								value={EBountyTab.ALL_BOUNTIES}
							>
								{t('Bounties.allBounties')}
							</TabsTrigger>
							<TabsTrigger
								className='flex-shrink-0 px-3 py-2 text-sm'
								value={EBountyTab.ANALYTICS}
							>
								{t('Bounties.analytics')}
							</TabsTrigger>
						</TabsList>
					</div>
				</div>
				<div className='mx-auto max-w-7xl px-4 py-5 lg:px-16'>
					<TabsContent
						className='m-0 grid grid-cols-1 gap-5 p-0'
						value={EBountyTab.ALL_BOUNTIES}
					>
						<BountiesStats />
						<div className='rounded-xl border border-border_grey bg-bg_modal p-6'>
							<div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
								<h2 className='text-2xl font-semibold text-text_primary'>{t('Bounties.parentBounties')}</h2>
								<div className='ml-auto flex items-center gap-2'>
									<div className='relative'>
										<input
											type='text'
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder={t('Bounties.searchPlaceholder')}
											className='bg-bg_card w-60 rounded-lg border border-primary_border px-4 py-2 pl-10 text-xs text-text_primary placeholder-basic_text focus:outline-none focus:ring-2 focus:ring-text_pink'
										/>
										<span className='absolute left-3 top-1/2 -translate-y-1/2 text-basic_text'>
											<SearchIcon size={16} />
										</span>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger
											asChild
											noArrow
											className='bg-bg_card !size-9 rounded-lg border border-primary_border p-2 hover:text-text_primary'
										>
											<button
												type='button'
												title='Filter by Status'
											>
												<FaFilter className='text-lg text-basic_text' />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align='end'
											className='w-48'
										>
											{statusValues.map((statusValue) => (
												<DropdownMenuItem
													key={statusValue}
													onClick={() => handleTabChange(statusValue)}
													className={`cursor-pointer px-3 py-2 text-sm ${status === statusValue ? 'bg-text_pink/10 text-text_pink' : 'hover:bg-bg_card text-text_primary'}`}
												>
													{t(`Bounties.${(statusValue as EBountyStatus)?.toLowerCase()}`)}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>

							{filteredData?.totalCount ? (
								<BountiesGrid items={filteredData?.items || []} />
							) : (
								<div className='flex flex-col items-center justify-center py-12'>
									<Image
										src={NoActivity}
										alt='no data'
										width={200}
										height={200}
									/>
									<p className='mt-4 text-sm text-text_primary'>{t('CreateProposalDropdownButton.noData')}</p>
								</div>
							)}

							{!searchQuery && initialData.totalCount > DEFAULT_LISTING_LIMIT && (
								<div className='mt-6 flex justify-end'>
									<PaginationWithLinks
										page={Number(page)}
										pageSize={DEFAULT_LISTING_LIMIT}
										totalCount={initialData?.totalCount || 0}
										pageSearchParam='page'
									/>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent
						value={EBountyTab.ANALYTICS}
						className='m-0 p-0'
					>
						<div className='flex min-h-[400px] items-center justify-center rounded-lg border border-border_grey bg-bg_modal'>
							<p className='text-text_secondary'>{t('Bounties.analyticsComingSoon')}</p>
						</div>
					</TabsContent>
				</div>
			</div>
		</Tabs>
	);
}

export default BountiesListingPage;
