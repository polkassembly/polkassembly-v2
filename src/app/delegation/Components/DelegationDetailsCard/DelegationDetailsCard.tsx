// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, RefObject, useRef } from 'react';
import Address from '@ui/Profile/Address/Address';
import { IoMdTrendingUp } from 'react-icons/io';
import { IoPersonAdd } from 'react-icons/io5';
import { EDelegateSource, ENetwork, IDelegateDetails } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { Label } from '@/app/_shared-components/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Button } from '@/app/_shared-components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/_shared-components/Select/Select';
import { FaFilter } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { MdSort } from 'react-icons/md';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { parseBalance } from '@/app/_client-utils/parseBalance';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Checkbox } from '@/app/_shared-components/checkbox';
import useDelegateFiltering from '@/hooks/useDelegateFiltering';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import PlatformLogos from '../PlatformLogos/PlatformLogos';
import DelegateSearchInput from '../DelegateSearchInput/DelegateSearchInput';
import styles from '../Delegation.module.scss';

interface DelegateCardProps {
	delegate: IDelegateDetails;
	network: ENetwork;
}

const DEFAULT_PLATFORM_STYLE = 'border-navbar_border bg-delegation_card_polkassembly';

export const getPlatformStyles = (platforms: EDelegateSource[]) => {
	if (!Array.isArray(platforms) || platforms.length === 0) {
		return DEFAULT_PLATFORM_STYLE;
	}

	if (platforms.length > 2) {
		return 'border-wallet_btn_text bg-delegation_bgcard';
	}

	const platform = String(platforms[0]).toLowerCase();
	switch (platform) {
		case 'polkassembly':
			return DEFAULT_PLATFORM_STYLE;
		case 'parity':
			return 'border-delegation_polkadot_border bg-delegation_card_polkadot';
		case 'w3f':
			return 'border-btn_secondary_text text-btn_primary_text bg-delegation_card_w3f';
		case 'nova':
			return 'border-delegation_nova_border bg-delegation_card_nova';
		case 'individual':
		case 'na':
			return 'border-btn_secondary_text bg-delegation_card_polkassembly';
		default:
			return 'border-wallet_btn_text bg-delegation_bgcard';
	}
};

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

const DelegateCard = memo(({ delegate, network }: DelegateCardProps) => {
	const t = useTranslations('Delegation');
	return (
		<div className='cursor-pointer rounded-md border border-border_grey hover:border-bg_pink'>
			<div className={`flex gap-2 rounded-t border py-1 ${getPlatformStyles([delegate.source])}`}>
				<PlatformLogos platforms={[delegate.source]} />
			</div>
			<div className='p-4'>
				<div className='flex items-center justify-between gap-2'>
					<Address address={delegate.address} />
					<div className='flex items-center gap-1 text-text_pink'>
						<IoPersonAdd />
						<span>{t('delegate')}</span>
					</div>
				</div>
				<div className='h-24 px-5'>
					<div className='text-sm text-text_primary'>
						{delegate?.manifesto && delegate?.manifesto.length > 0 ? (
							delegate?.manifesto?.includes('<') ? (
								<div className='bio-content'>
									<div className='flex max-h-40 w-full overflow-hidden border-none'>
										<MarkdownEditor
											markdown={delegate.manifesto}
											readOnly
										/>
									</div>
									{delegate?.manifesto?.length > 100 && (
										<button
											className='cursor-pointer text-xs font-medium text-blue-600'
											type='button'
										>
											{t('readMore')}
										</button>
									)}
								</div>
							) : (
								<div className='bio-content'>
									<span>{delegate?.manifesto?.slice(0, 100)}</span>
									{delegate?.manifesto?.length > 100 && (
										<>
											<span>... </span>
											<button
												className='cursor-pointer text-xs font-medium text-blue-600'
												type='button'
											>
												{t('readMore')}
											</button>
										</>
									)}
								</div>
							)
						) : (
							<span>{t('noBio')}</span>
						)}
					</div>
				</div>
			</div>
			<div className='grid grid-cols-3 items-center border-t border-border_grey'>
				<div className='border-r border-border_grey p-5 text-center'>
					<div>
						<div className='text-sm text-btn_secondary_text'>
							<span className='text-2xl font-semibold'> {parseBalance(delegate?.votingPower?.toString() || '0', 1, false, network)}</span>{' '}
							{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}
						</div>
						<span className='text-xs text-delegation_card_text'>{t('votingPower')}</span>
					</div>
				</div>
				<div className='border-r border-border_grey p-3 text-center'>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.last30DaysVotedProposalsCount}</div>
						<span className='text-xs text-delegation_card_text'>{t('votedProposals')}</span>
						<span className='block text-[10px] text-delegation_card_text'>({t('past30Days')})</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.receivedDelegationsCount}</div>
						<span className='text-xs text-delegation_card_text lg:whitespace-nowrap'>{t('receivedDelegations')}</span>
					</div>
				</div>
			</div>
		</div>
	);
});

function DelegationDetailsCard() {
	const { data: delegates, isFetching } = useQuery({
		queryKey: ['delegates'],
		queryFn: () => NextApiClientService.fetchDelegates()
	});
	const searchInputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');

	const {
		paginatedDelegates,
		totalDelegates,
		searchQuery,
		handleSearchChange,
		selectedSources,
		handleSourceChange,
		sortBy,
		handleSortChange,
		currentPage,
		handlePageChange,
		itemsPerPage
	} = useDelegateFiltering(delegates?.data ?? []);

	return (
		<div className='mt-5 min-h-80 w-full rounded-lg bg-bg_modal p-4 shadow-lg'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
					<p className='text-xl font-semibold text-btn_secondary_text'>{t('trendingDelegates')}</p>
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
			{isFetching ? (
				<div className='relative mt-20'>
					<LoadingLayover />
				</div>
			) : (
				<div>
					{paginatedDelegates.length > 0 ? (
						<>
							<div className='my-5 grid w-full items-center gap-5 lg:grid-cols-2'>
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
									onClick={handlePageChange}
								/>
							</div>
						</>
					) : (
						<div className='my-20 flex justify-center'>
							<p className='text-text_secondary text-lg'>No delegates found matching your criteria</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default memo(DelegationDetailsCard);
