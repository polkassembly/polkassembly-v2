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

	const outcomeChangedCount = filteredAndSortedData.filter((r) => r.influence === EInfluenceStatus.CHANGED_TO_PASS || r.influence === EInfluenceStatus.CHANGED_TO_FAIL).length;

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
			<div className='my-4 w-full rounded-2xl border border-border_grey bg-bg_modal p-6'>
				<div className='grid grid-cols-[1fr_auto] gap-y-4 lg:flex lg:flex-nowrap lg:items-center lg:justify-between lg:gap-4'>
					<div className='order-1 flex min-w-0 items-center gap-2 lg:order-1'>
						<Image
							src={TimeLineIcon}
							alt='Timeline Icon'
							width={24}
							height={24}
							className='h-6 w-6'
						/>{' '}
						<h2 className='truncate text-lg font-semibold text-navbar_title lg:text-2xl'>{t('InfluenceByReferenda')}</h2>
					</div>

					<span className='order-3 col-span-2 w-full rounded-lg bg-bounty_dash_bg p-2 text-xs font-medium text-wallet_btn_text lg:order-2 lg:ml-2 lg:w-auto'>
						{t('OutcomeChanged')} {outcomeChangedCount} ({outcomePercent}%) | {t('Total')} {totalCount}
					</span>

					<div className='order-2 ml-auto flex w-auto items-center justify-end gap-2 lg:order-3'>
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
