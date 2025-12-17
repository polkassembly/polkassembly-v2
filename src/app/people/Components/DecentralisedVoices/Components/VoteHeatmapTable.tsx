// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IDVDelegateVotingMatrix } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Button } from '@/app/_shared-components/Button';
import { getVoteBarColor, getVoteColor, getVoteIcon } from '@/_shared/_utils/dvVoteHelpers';

interface VoteHeatmapTableProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
}

function VoteHeatmapRow({ item, referendumIndices }: { item: IDVDelegateVotingMatrix; referendumIndices: number[] }) {
	const t = useTranslations('DecentralizedVoices');
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const checkScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			setShowLeftArrow(scrollLeft > 0);
			setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
		}
	};

	useEffect(() => {
		checkScroll();
		window.addEventListener('resize', checkScroll);
		return () => window.removeEventListener('resize', checkScroll);
	}, [referendumIndices.length]);

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const scrollAmount = 200;
			scrollRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	};

	return (
		<div className='w-full rounded-2xl border border-border_grey bg-bg_modal'>
			<div className='flex flex-col items-start gap-2 border-b border-border_grey p-4 md:flex-row md:items-center'>
				<div className='flex items-center gap-2'>
					<Address address={item.address} />
					<span className='rounded bg-sidebar_footer px-2 py-1 text-xs text-text_primary'>{item.participation.toFixed(1)}% active</span>
				</div>
			</div>

			<div className='relative flex w-full items-center p-4'>
				{showLeftArrow && (
					<Button
						variant='outline'
						size='icon'
						onClick={() => scroll('left')}
						className='absolute left-0 z-10 flex items-center justify-center rounded-full bg-gradient-to-r from-bg_modal to-transparent px-1 hover:text-text_pink'
					>
						<ChevronLeft size={18} />
					</Button>
				)}

				<div
					ref={scrollRef}
					onScroll={checkScroll}
					className='hide_scrollbar flex w-full overflow-x-auto'
				>
					<div className='flex gap-2.5 px-4'>
						{referendumIndices.map((ref) => {
							const vote = item.votes[ref] || '';
							return (
								<div
									key={ref}
									className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${getVoteColor(vote)}`}
									title={`${t('Referendum')} #${ref}: ${vote}`}
								>
									{getVoteIcon(vote)}
								</div>
							);
						})}
					</div>
				</div>

				{showRightArrow && (
					<Button
						size='icon'
						variant='outline'
						onClick={() => scroll('right')}
						className='absolute right-0 z-10 flex items-center justify-center rounded-full bg-gradient-to-l from-bg_modal to-transparent px-1 hover:text-text_pink'
					>
						<ChevronRight size={18} />
					</Button>
				)}
			</div>
			<div className='flex h-1.5 w-full overflow-hidden rounded-b-2xl'>
				{referendumIndices.map((ref) => (
					<div
						key={ref}
						className={`flex-1 flex-shrink-0 ${getVoteBarColor(item.votes[ref] || '')}`}
					/>
				))}
			</div>
		</div>
	);
}

function VoteHeatmapTable({ votingMatrix, referendumIndices }: VoteHeatmapTableProps) {
	return (
		<div className='flex flex-col gap-4 pt-3'>
			{votingMatrix.map((item) => (
				<VoteHeatmapRow
					key={item.address}
					item={item}
					referendumIndices={referendumIndices}
				/>
			))}
		</div>
	);
}

export default VoteHeatmapTable;
