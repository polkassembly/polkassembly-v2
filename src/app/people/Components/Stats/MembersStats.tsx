// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { RefObject } from 'react';
import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Image from 'next/image';
import TotalMembers from '@assets/icons/proposals.svg';
import VerifiedMembers from '@assets/icons/votes.svg';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/_shared-components/Select/Select';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { EDelegateSource } from '@/_shared/types';
import FilterPopover from './FilterPopover';

interface MembersStatsProps {
	totalMembers: number;
	verifiedMembers: number;
	searchQuery: string;
	handleSearchChange: (value: string) => void;
	selectedSources: EDelegateSource[];
	handleSourceChange: (sources: EDelegateSource[]) => void;
	sortBy: 'MAX_DELEGATED' | 'VOTED_PROPOSALS' | 'DELEGATORS' | null;
	handleSortChange: (value: 'MAX_DELEGATED' | 'VOTED_PROPOSALS' | 'DELEGATORS') => void;
	searchInputRef: RefObject<HTMLInputElement>;
}

function MembersStats({
	totalMembers,
	verifiedMembers,
	searchQuery,
	handleSearchChange,
	selectedSources,
	handleSourceChange,
	sortBy,
	handleSortChange,
	searchInputRef
}: MembersStatsProps) {
	const t = useTranslations('Community.Members');
	const tDelegation = useTranslations('Delegation');
	const tJudgements = useTranslations('Judgements');

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4 md:flex-row md:items-center md:justify-between'>
			<div className='flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:gap-6 lg:gap-x-12'>
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

			<div className='flex items-center gap-4'>
				<div className='relative'>
					<input
						type='text'
						ref={searchInputRef}
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder={tJudgements('searchByAddressOrName')}
						className='bg-bg_card w-60 rounded-lg border border-primary_border px-4 py-2 pl-10 text-xs text-text_primary placeholder-basic_text focus:outline-none focus:ring-2 focus:ring-text_pink'
					/>
					<span className='absolute left-3 top-1/2 -translate-y-1/2 text-basic_text'>
						<SearchIcon size={16} />
					</span>
				</div>
				<FilterPopover
					selectedSources={selectedSources}
					setSelectedSources={handleSourceChange}
				/>
				<div className='flex items-center'>
					<Select
						value={sortBy ?? ''}
						onValueChange={(value) => handleSortChange(value as 'MAX_DELEGATED' | 'VOTED_PROPOSALS' | 'DELEGATORS')}
					>
						<SelectTrigger
							hideChevron
							className='focus:ring-pink_primary rounded-md border border-border_grey px-2 focus:ring-1'
						>
							<MdSort className='text-wallet-btn_text text-xl' />
						</SelectTrigger>
						<SelectContent className='border-border_grey bg-bg_modal'>
							<SelectItem value='MAX_DELEGATED'>{tDelegation('maxDelegated')}</SelectItem>
							<SelectItem value='VOTED_PROPOSALS'>{tDelegation('votedProposals')}</SelectItem>
							<SelectItem value='DELEGATORS'>{tDelegation('delegators')}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
export default MembersStats;
