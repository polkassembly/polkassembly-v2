// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useMemo, memo, RefObject, useRef, useCallback, useEffect } from 'react';
import Address from '@ui/Profile/Address/Address';
import { IoMdTrendingUp } from 'react-icons/io';
import { IoPersonAdd } from 'react-icons/io5';
import { EDelegateSource, ENetwork, IDelegate } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import BlockEditor from '@/app/_shared-components/BlockEditor/BlockEditor';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Label } from '@/app/_shared-components/Label';
import { Checkbox } from '@/app/_shared-components/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Button } from '@/app/_shared-components/Button';
import { parseBalance } from '@/app/_client-utils/parseBalance';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/_shared-components/Select/Select';
import { FaFilter } from 'react-icons/fa';
import useDelegateFiltering from '@/hooks/useDelegateFiltering';
import { MdSort } from 'react-icons/md';
import PlatformLogos, { getPlatformStyles } from './PlatformLogos';
import DelegateSearchInput from './DelegateSearchInput';
import styles from './Delegation.module.scss';

interface DelegateCardProps {
	delegate: IDelegate;
	network: ENetwork;
}

export const SOURCE_OPTIONS = [
	{ label: 'Polkassembly', value: EDelegateSource.POLKASSEMBLY },
	{ label: 'Parity', value: EDelegateSource.PARITY },
	{ label: 'Nova', value: EDelegateSource.NOVA },
	{ label: 'W3F', value: EDelegateSource.W3F },
	{ label: 'Individual', value: EDelegateSource.NA }
] as const;

export const SORT_OPTIONS = {
	votingPower: 'Voting Power',
	votedProposals: 'Voted Proposals',
	receivedDelegations: 'Received Delegations'
} as const;

const FilterPopover = memo(({ selectedSources, setSelectedSources }: { selectedSources: EDelegateSource[]; setSelectedSources: (sources: EDelegateSource[]) => void }) => (
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
					Clear All
				</button>
			</div>
			<hr className='my-2 border-text_pink' />
			<div className='mt-2 space-y-4'>
				{SOURCE_OPTIONS.map((source) => (
					<div
						key={source.value}
						className='flex items-center space-x-2'
					>
						<Checkbox
							checked={selectedSources.includes(source.value)}
							onCheckedChange={(checked) => {
								setSelectedSources(checked ? [...selectedSources, source.value] : selectedSources.filter((s) => s !== source.value));
							}}
						/>
						<Label className='text-sm text-text_primary'>{source.label}</Label>
					</div>
				))}
			</div>
		</PopoverContent>
	</Popover>
));

const DelegateCard = memo(({ delegate, network }: DelegateCardProps) => (
	<div className='cursor-pointer rounded-md border border-border_grey hover:border-bg_pink'>
		<div className={`flex gap-2 rounded-t border py-1 ${getPlatformStyles(delegate.dataSource)}`}>
			<PlatformLogos platforms={delegate.dataSource} />
		</div>
		<div className='p-4'>
			<div className='flex items-center justify-between gap-2'>
				<Address address={delegate.address} />
				<div className='flex items-center gap-1 text-text_pink'>
					<IoPersonAdd />
					<span>Delegate</span>
				</div>
			</div>
			<div className='h-24 px-5'>
				<div className='text-sm text-text_primary'>
					{delegate.bio.length > 0 ? (
						delegate.bio.includes('<') ? (
							<div className='bio-content'>
								<BlockEditor
									data={delegate.bio}
									readOnly
									id={`delegate-bio-${delegate.address}`}
									className='text-sm text-text_primary'
								/>
								{delegate.bio.length > 100 && (
									<button
										className='cursor-pointer text-xs font-medium text-blue-600'
										type='button'
									>
										Read more
									</button>
								)}
							</div>
						) : (
							<div className='bio-content'>
								<span>{delegate.bio.slice(0, 100)}</span>
								{delegate.bio.length > 100 && (
									<>
										<span>... </span>
										<button
											className='cursor-pointer text-xs font-medium text-blue-600'
											type='button'
										>
											Read more
										</button>
									</>
								)}
							</div>
						)
					) : (
						<span>No Bio</span>
					)}
				</div>
			</div>
		</div>
		<div className='grid grid-cols-3 items-center border-t border-border_grey'>
			<div className='border-r border-border_grey p-5 text-center'>
				<div>
					<div className='text-sm text-btn_secondary_text'>
						<span className='text-2xl font-semibold'> {parseBalance(delegate?.delegatedBalance.toString(), 1, false, network)}</span>{' '}
						{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}
					</div>
					<span className='text-xs text-delegation_card_text'>Voting power</span>
				</div>
			</div>
			<div className='border-r border-border_grey p-3 text-center'>
				<div>
					<div className='text-2xl font-semibold'>{delegate?.votedProposalCount?.convictionVotesConnection?.totalCount}</div>
					<span className='text-xs text-delegation_card_text'>Voted proposals </span>
					<span className='block text-[10px] text-delegation_card_text'>(Past 30 Days)</span>
				</div>
			</div>
			<div className='p-5 text-center'>
				<div>
					<div className='text-2xl font-semibold'>{delegate?.receivedDelegationsCount}</div>
					<span className='text-xs text-delegation_card_text lg:whitespace-nowrap'>Received Delegation</span>
				</div>
			</div>
		</div>
	</div>
));

function DelegationCard({ delegates }: { delegates: IDelegate[] }) {
	const [currentPage, setCurrentPage] = useState(1);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const itemsPerPage = DEFAULT_LISTING_LIMIT;

	const { filteredAndSortedDelegates, searchQuery, handleSearchChange, selectedSources, setSelectedSources, sortBy, setSortBy } = useDelegateFiltering(delegates);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedSources, sortBy]);

	const currentDelegates = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedDelegates.slice(start, start + itemsPerPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, filteredAndSortedDelegates]);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	return (
		<div className='mt-5 w-full rounded-lg bg-bg_modal p-4 shadow-lg'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
					<p className='text-xl font-semibold text-btn_secondary_text'>Trending Delegates</p>
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
					setSelectedSources={setSelectedSources}
				/>
				<div className='flex items-center gap-2'>
					<Select
						value={sortBy}
						onValueChange={(value: typeof sortBy) => setSortBy(value)}
					>
						<SelectTrigger
							className={styles.selectTrigger}
							showDropdown={false}
						>
							<MdSort className='text-3xl text-text_pink' />
						</SelectTrigger>
						<SelectContent className={styles.selectContent}>
							<SelectItem value='votingPower'>Voting Power</SelectItem>
							<SelectItem value='votedProposals'>Voted Proposals</SelectItem>
							<SelectItem value='receivedDelegations'>Received Delegations</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className='my-5 grid w-full items-center gap-5 lg:grid-cols-2'>
				{currentDelegates.map((delegate) => (
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
					totalCount={filteredAndSortedDelegates.length}
					onClick={handlePageChange}
				/>
			</div>
		</div>
	);
}

DelegationCard.displayName = 'DelegationCard';

export default memo(DelegationCard);
