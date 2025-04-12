// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, RefObject, useRef } from 'react';
import { IoMdTrendingUp } from 'react-icons/io';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { Label } from '@/app/_shared-components/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Button } from '@/app/_shared-components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/_shared-components/Select/Select';
import { FaFilter } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { MdSort } from 'react-icons/md';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import useDelegateFiltering from '@/hooks/useDelegateFiltering';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { useAtom } from 'jotai';
import { delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import DelegateSearchInput from '../DelegateSearchInput/DelegateSearchInput';
import styles from '../Delegation.module.scss';
import DelegateCard from '../DelegationCard/DelegationCard';

const FilterPopover = memo(({ selectedSources, setSelectedSources }: { selectedSources: EDelegateSource[]; setSelectedSources: (sources: EDelegateSource[]) => void }) => {
	const t = useTranslations('Delegation');
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='outline'>
					<FaFilter className='text-text_pink' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] border-border_grey p-4'>
				<div className='flex items-center justify-end'>
					<button
						onClick={() => setSelectedSources([])}
						className='cursor-pointer text-sm font-medium text-text_pink'
						type='button'
					>
						{t('clearAll')}
					</button>
				</div>
				<hr className='my-2 border-text_pink' />
				<div className='mt-2 space-y-4'>
					{Object.values(EDelegateSource).map((source) => (
						<div
							key={source}
							className='flex items-center space-x-2'
						>
							<Checkbox
								checked={selectedSources.includes(source)}
								onCheckedChange={(checked: boolean) => {
									setSelectedSources(checked ? [...selectedSources, source] : selectedSources.filter((s) => s !== source));
								}}
							/>
							<Label className='text-sm text-text_primary'>{source.charAt(0).toUpperCase() + source.slice(1)}</Label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
});

function DelegationDetailsCard() {
	const [delegates, setDelegates] = useAtom(delegatesAtom);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');

	const { isLoading } = useQuery({
		queryKey: ['delegates'],
		queryFn: async () => {
			if (delegates.length > 0) {
				return { data: delegates };
			}
			const result = await NextApiClientService.fetchDelegates();
			if (result?.data) {
				setDelegates(result.data);
			}
			return result || { data: [] };
		},
		staleTime: STALE_TIME
	});

	const {
		paginatedDelegates,
		totalDelegates,
		searchQuery,
		handlePageChange,
		handleSearchChange,
		selectedSources,
		handleSourceChange,
		sortBy,
		handleSortChange,
		currentPage,
		itemsPerPage
	} = useDelegateFiltering(delegates);

	return (
		<div className={styles.delegationDetailsCard}>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
					<p className={styles.delegationDetailsCardTitle}>{t('trendingDelegates')}</p>
				</div>
			</div>
			<div className='flex items-center gap-4'>
				<DelegateSearchInput
					searchInputRef={searchInputRef as RefObject<HTMLInputElement>}
					searchTerm={searchQuery}
					handleSearchChange={handleSearchChange}
				/>
				<FilterPopover
					selectedSources={selectedSources}
					setSelectedSources={handleSourceChange}
				/>
				<div className='flex items-center gap-2'>
					<Select
						value={sortBy}
						onValueChange={handleSortChange}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<MdSort className='text-3xl text-text_pink' />
						</SelectTrigger>
						<SelectContent className={styles.selectContent}>
							<SelectItem value='VOTING_POWER'>{t('votingPower')}</SelectItem>
							<SelectItem value='VOTED_PROPOSALS'>{t('votedProposals')}</SelectItem>
							<SelectItem value='RECEIVED_DELEGATIONS'>{t('receivedDelegations')}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			{isLoading ? (
				<div className='relative mt-20'>
					<LoadingLayover />
				</div>
			) : (
				<div>
					{paginatedDelegates.length > 0 ? (
						<>
							<div className='my-5 grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
								{paginatedDelegates.map((delegate: IDelegateDetails) => (
									<DelegateCard
										key={delegate.address}
										delegate={delegate}
										network={network}
									/>
								))}
							</div>
							<div className='mt-6 flex w-full items-center justify-end'>
								<PaginationWithLinks
									page={currentPage}
									pageSize={itemsPerPage}
									totalCount={totalDelegates}
									onPageChange={handlePageChange}
								/>
							</div>
						</>
					) : (
						<div className='my-20 flex justify-center'>
							<p className='text-text_secondary text-lg'>{t('noDelegatesFoundMatchingYourCriteria')}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
export default memo(DelegationDetailsCard);
