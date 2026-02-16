// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { IDVDelegateVotingMatrix, EVoteDecision } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Skeleton } from '@/app/_shared-components/Skeleton';

interface VoteCompactViewProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
	loading?: boolean;
}

function VoteCompactView({ votingMatrix, referendumIndices, loading }: VoteCompactViewProps) {
	const t = useTranslations('');
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showRightFade, setShowRightFade] = useState(true);

	const checkScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			setShowRightFade(scrollLeft + clientWidth < scrollWidth - 1);
		}
	};

	useEffect(() => {
		checkScroll();
		window.addEventListener('resize', checkScroll);
		return () => window.removeEventListener('resize', checkScroll);
	}, [referendumIndices.length]);

	if (loading) {
		return (
			<div className='w-full'>
				<div className='mb-4 flex gap-4'>
					<Skeleton className='h-6 w-32' />
					<div className='flex flex-1 gap-2'>
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton
								key={i}
								className='h-6 w-12'
							/>
						))}
					</div>
				</div>
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className='mb-4 flex items-center gap-4'
					>
						<Skeleton className='h-8 w-48' />
						<div className='flex flex-1 gap-2'>
							{[1, 2, 3, 4, 5].map((j) => (
								<Skeleton
									key={j}
									className='h-8 w-12'
								/>
							))}
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className='relative w-full overflow-hidden'>
			<div
				ref={scrollRef}
				onScroll={checkScroll}
				className='hide_scrollbar overflow-x-auto'
			>
				<table className='w-full min-w-max border-separate border-spacing-0'>
					<thead>
						<tr className='border-b border-border_grey'>
							<th className='sticky left-0 z-10 bg-bg_modal py-4 pr-4 text-left text-xs font-semibold uppercase text-text_primary'>{t('PostDetails.account')}</th>
							{referendumIndices.map((ref) => (
								<th
									key={ref}
									className='px-2 py-4 text-center text-xs font-semibold text-text_primary'
								>
									#{ref}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{votingMatrix.map((item) => (
							<tr
								key={item.address}
								className='group'
							>
								<td className='sticky left-0 z-10 bg-bg_modal py-3 pr-4'>
									<Address address={item.address} />
								</td>
								{referendumIndices.map((ref) => {
									const vote = item.votes[ref];
									let bgClass = '';

									switch (vote) {
										case EVoteDecision.AYE:
											bgClass = 'bg-social_green/30';
											break;
										case EVoteDecision.NAY:
											bgClass = 'bg-failure/30';
											break;
										case EVoteDecision.ABSTAIN:
											bgClass = 'bg-dv_voting_card_abstain_bar_color/30';
											break;
										default:
											bgClass = 'bg-activity_selected_tab';
									}

									return (
										<td
											key={ref}
											className='py-3 text-center'
										>
											<div className='flex justify-center'>
												{vote ? (
													<div className={`h-4 w-4 rounded-sm ${bgClass}`} />
												) : (
													<span className={`flex h-4 w-4 items-center justify-center rounded-sm text-text_primary ${bgClass}`}>-</span>
												)}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{showRightFade && <div className='pointer-events-none absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-bg_modal to-transparent' />}

			<div className='mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-border_grey pt-4'>
				<div className='flex items-center gap-2'>
					<div className='h-4 w-4 rounded-sm bg-social_green/30' />
					<span className='text-xs font-medium text-text_primary'>{t('DecentralizedVoices.Aye')}</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-4 w-4 rounded-sm bg-failure/30' />
					<span className='text-xs font-medium text-text_primary'>{t('DecentralizedVoices.Nay')}</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-4 w-4 rounded-sm bg-dv_voting_card_abstain_bar_color/30' />
					<span className='text-xs font-medium text-text_primary'>{t('DecentralizedVoices.Abstain')}</span>
				</div>
				<div className='flex items-center gap-2'>
					<span className='flex h-4 w-4 items-center justify-center rounded-sm bg-activity_selected_tab text-text_primary'>-</span>
					<span className='text-xs font-medium text-text_primary'>{t('DecentralizedVoices.NoVote')}</span>
				</div>
			</div>
		</div>
	);
}

export default VoteCompactView;
