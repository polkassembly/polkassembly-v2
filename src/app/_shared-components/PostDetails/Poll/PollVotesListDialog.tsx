// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { IPoll, IPollVote } from '@/_shared/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import dayjs from 'dayjs';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { POLL_OPTION_SLICE_TILL } from '@/_shared/_constants/pollLimits';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import classes from './Poll.module.scss';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import { Skeleton } from '../../Skeleton';

function PollVotesListDialog({ votes, poll, loading }: { votes: IPollVote[]; poll: IPoll; loading: boolean }) {
	const t = useTranslations('PostDetails.Poll');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string>(poll.options[0]);

	const voteStats = useMemo(() => {
		const stats: Record<string, { count: number; votes: IPollVote[] }> = {};
		poll.options.forEach((option) => {
			stats[`${option}`] = { count: 0, votes: [] };
		});
		votes.forEach((vote) => {
			if (stats[vote.selectedOption] !== undefined) {
				stats[vote.selectedOption].count += 1;
				stats[vote.selectedOption].votes.push(vote);
			}
		});
		return stats;
	}, [votes, poll.options]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger className='w-full'>
				<Button
					variant='outline'
					className='flex w-full items-center justify-between gap-1 rounded-md border-border_grey text-sm font-semibold text-text_pink'
				>
					<span>{t('viewPollVotes')}</span>
					<ChevronRight className='' />
				</Button>
			</DialogTrigger>
			<DialogContent className={classes.dialogContent}>
				<DialogHeader>
					<DialogTitle className={classes.dialogTitle}>
						<span>{t('viewPollVotes')}</span>
						<span className={classes.votesCount}>{`(${votes.length})`}</span>
					</DialogTitle>
				</DialogHeader>
				<div className={classes.pollVotesList}>
					<div className={classes.pollTitle}>{poll.title}</div>
					<div className={classes.pollVotesListWrapper}>
						<div className={`grid grid-cols-${poll.options.length} gap-2`}>
							{Object.entries(voteStats).map(([option, { count }]) => (
								<Button
									variant='ghost'
									onClick={() => setSelectedOption(option)}
									key={option}
									className={cn(
										'flex h-14 w-full flex-col items-center gap-0 rounded-xl p-0 py-2 text-sm text-text_primary',
										selectedOption === option ? 'bg-bg_pink/10' : 'bg-transparent'
									)}
								>
									<span className={cn('text-base font-bold', selectedOption === option ? 'text-text_pink' : 'text-text_primary')}>{count}</span>
									<span>
										{option?.slice(0, POLL_OPTION_SLICE_TILL)}
										{option?.length > POLL_OPTION_SLICE_TILL && '...'}
									</span>
								</Button>
							))}
						</div>
						<Separator
							orientation='horizontal'
							className='my-4'
						/>
						{loading ? (
							<div className={classes.loadingVotesWrapper}>
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
							</div>
						) : voteStats[`${selectedOption}`]?.count > 0 ? (
							<div className={classes.votesList}>
								{voteStats[`${selectedOption}`]?.votes.map((vote) => {
									const address = vote?.publicUser?.addresses[0];
									return (
										<div
											key={vote.id}
											className={classes.voteItem}
										>
											{address ? (
												<Address
													address={address}
													truncateCharLen={3}
												/>
											) : (
												<span>{vote.publicUser?.username}</span>
											)}
											<span className=''>{dayjs(vote.createdAt).format('DD/MM/YYYY')}</span>
											<span>
												{vote.selectedOption?.slice(0, POLL_OPTION_SLICE_TILL)}
												{vote.selectedOption?.length > POLL_OPTION_SLICE_TILL && '...'}
											</span>
										</div>
									);
								})}
							</div>
						) : (
							<div className={classes.noVotesWrapper}>
								<Image
									src={NoActivity}
									alt='No votes yet'
									height={100}
									width={100}
								/>
								<span className={classes.noVotesText}>{t('noVotes')}</span>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PollVotesListDialog;
