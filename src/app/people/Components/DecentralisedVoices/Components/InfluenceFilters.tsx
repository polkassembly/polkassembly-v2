// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { MdSort } from '@react-icons/all-files/md/MdSort';

type SortOption = 'index' | 'status' | 'influence' | 'votes';
type SortDirection = 'asc' | 'desc';

interface InfluenceFiltersProps {
	selectedTracks: string[];
	availableTracks: string[];
	sortBy: SortOption;
	sortDirection: SortDirection;
	onTrackToggle: (track: string) => void;
	onClearTracks: () => void;
	onSort: (option: SortOption) => void;
	onClearAll: () => void;
}

function InfluenceFilters({ selectedTracks, availableTracks, sortBy, sortDirection, onTrackToggle, onClearTracks, onSort, onClearAll }: InfluenceFiltersProps) {
	const t = useTranslations('DecentralizedVoices');

	return (
		<div className='flex items-center gap-2'>
			<Popover>
				<PopoverTrigger asChild>
					<button
						type='button'
						className={`flex items-center gap-1 rounded-md border p-2 ${selectedTracks.length > 0 ? 'border-text_pink bg-text_pink/10' : 'border-border_grey'}`}
					>
						<Filter className='h-4 w-4 text-wallet_btn_text' />
						{selectedTracks.length > 0 && <span className='ml-1 rounded-full bg-text_pink px-1.5 text-xs text-btn_primary_text'>{selectedTracks.length}</span>}
					</button>
				</PopoverTrigger>
				<PopoverContent className='max-h-64 w-56 overflow-y-auto border-border_grey p-3'>
					<div className='mb-2 flex items-center justify-between'>
						<span className='text-xs font-semibold text-text_primary'>{t('FilterByTrack')}</span>
						<button
							type='button'
							onClick={onClearTracks}
							className='text-xs text-text_pink'
						>
							{t('Clear')}
						</button>
					</div>
					<div className='space-y-2'>
						{availableTracks.map((track) => (
							<div
								key={track}
								className='flex items-center gap-2'
							>
								<Checkbox
									checked={selectedTracks.includes(track)}
									onCheckedChange={() => onTrackToggle(track)}
								/>
								<span className='text-xs text-text_primary'>{convertCamelCaseToTitleCase(track)}</span>
							</div>
						))}
					</div>
				</PopoverContent>
			</Popover>

			<Popover>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='flex items-center gap-1 rounded-md border border-border_grey p-1.5'
					>
						<MdSort className='text-xl text-wallet_btn_text' />
					</button>
				</PopoverTrigger>
				<PopoverContent className='w-48 border-border_grey p-3'>
					<div className='mb-2 text-xs font-semibold text-text_primary'>{t('SortBy')}</div>
					<div className='space-y-1'>
						{[
							{ value: 'index', label: `${t('Referendum')} #` },
							{ value: 'status', label: t('Status') },
							{ value: 'influence', label: t('Influence') },
							{ value: 'votes', label: t('VotingPower') }
						].map((option) => (
							<button
								key={option.value}
								type='button'
								onClick={() => onSort(option.value as SortOption)}
								className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs ${sortBy === option.value ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
							>
								{option.label}
								{sortBy === option.value && <span className='text-[10px]'>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
							</button>
						))}
					</div>
				</PopoverContent>
			</Popover>

			{selectedTracks.length > 0 && (
				<button
					type='button'
					onClick={onClearAll}
					className='rounded-md border border-toast_error_text px-3 py-2 text-xs text-toast_error_text'
				>
					{t('ClearAll')}
				</button>
			)}
		</div>
	);
}

export default InfluenceFilters;
