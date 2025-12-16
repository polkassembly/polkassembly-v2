// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { IDVReferendumInfluence, EInfluenceStatus } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { MdArrowDropDown } from '@react-icons/all-files/md/MdArrowDropDown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import Image from 'next/image';
import TimeLineIcon from '@assets/icons/timeline.svg';
import DVVotesDialog from './DVVotesDialog';
import InfluenceFilters from './InfluenceFilters';
import InfluenceTable from './InfluenceTable';

interface InfluenceCardProps {
	referendaInfluence: IDVReferendumInfluence[];
	loading?: boolean;
	cohortId?: number;
}

type SortOption = 'index' | 'status' | 'influence' | 'votes';
type SortDirection = 'asc' | 'desc';

function InfluenceCard({ referendaInfluence, loading, cohortId }: InfluenceCardProps) {
	const t = useTranslations('DecentralizedVoices');
	const [isOpen, setIsOpen] = useState(true);
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState<SortOption>('index');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [selectedReferendum, setSelectedReferendum] = useState<IDVReferendumInfluence | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const pageSize = 10;
	const network = getCurrentNetwork();

	const availableTracks = useMemo(() => {
		const tracks = [...new Set(referendaInfluence.map((r) => r.track))];
		return tracks.sort();
	}, [referendaInfluence]);

	const filteredAndSortedData = useMemo(() => {
		let data = [...referendaInfluence];

		if (selectedTracks.length > 0) {
			data = data.filter((r) => selectedTracks.includes(r.track));
		}

		data.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'index':
					comparison = a.index - b.index;
					break;
				case 'status':
					comparison = a.status.localeCompare(b.status);
					break;
				case 'influence':
					comparison = a.influence.localeCompare(b.influence);
					break;
				case 'votes': {
					const aPower = BigInt(a.dvTotalVotingPower || '0');
					const bPower = BigInt(b.dvTotalVotingPower || '0');
					comparison = aPower > bPower ? 1 : aPower < bPower ? -1 : 0;
					break;
				}
				default:
					comparison = 0;
			}
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		return data;
	}, [referendaInfluence, selectedTracks, sortBy, sortDirection]);

	const outcomeChangedCount = filteredAndSortedData.filter((r) => r.influence === EInfluenceStatus.APPROVED || r.influence === EInfluenceStatus.REJECTED).length;

	const totalCount = filteredAndSortedData.length;
	const outcomePercent = totalCount > 0 ? ((outcomeChangedCount / totalCount) * 100).toFixed(2) : '0';

	const paginatedData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);

	const handleSort = (option: SortOption) => {
		if (sortBy === option) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(option);
			setSortDirection('desc');
		}
		setPage(1);
	};

	const handleTrackToggle = (track: string) => {
		setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]));
		setPage(1);
	};

	const clearFilters = () => {
		setSelectedTracks([]);
		setPage(1);
	};

	const handleReferendumClick = (item: IDVReferendumInfluence) => {
		setSelectedReferendum(item);
		setIsDialogOpen(true);
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
				<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
					<div className='flex items-center gap-2'>
						<Image
							src={TimeLineIcon}
							alt='Delegation Green Icon'
							width={24}
							height={24}
							className='h-6 w-6'
						/>{' '}
						<h2 className='text-2xl font-semibold text-navbar_title'>{t('InfluenceByReferenda')}</h2>
						<span className='ml-2 rounded-lg bg-bounty_dash_bg p-2 text-xs font-medium text-wallet_btn_text'>
							{t('OutcomeChanged')} {outcomeChangedCount} ({outcomePercent}%) | {t('Total')} {totalCount}
						</span>
					</div>
					<div className='flex items-center gap-2'>
						<InfluenceFilters
							selectedTracks={selectedTracks}
							availableTracks={availableTracks}
							sortBy={sortBy}
							sortDirection={sortDirection}
							onTrackToggle={handleTrackToggle}
							onClearTracks={() => setSelectedTracks([])}
							onSort={handleSort}
							onClearAll={clearFilters}
						/>
						<CollapsibleTrigger asChild>
							<button
								type='button'
								className='transition-transform duration-200'
								style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
							>
								<MdArrowDropDown className='text-3xl text-wallet_btn_text' />
							</button>
						</CollapsibleTrigger>
					</div>
				</div>
				<CollapsibleContent>
					<InfluenceTable
						data={paginatedData}
						network={network}
						loading={loading}
						onReferendumClick={handleReferendumClick}
					/>

					{totalCount > pageSize && (
						<div className='mt-6 flex justify-center gap-2'>
							<PaginationWithLinks
								totalCount={totalCount}
								pageSize={pageSize}
								page={page}
								onPageChange={setPage}
							/>
						</div>
					)}
				</CollapsibleContent>
			</div>

			<DVVotesDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				data={selectedReferendum}
				cohortId={cohortId}
			/>
		</Collapsible>
	);
}

export default InfluenceCard;
