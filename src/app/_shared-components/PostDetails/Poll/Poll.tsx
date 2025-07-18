// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENotificationStatus, EPollVotesType, EProposalType, IPoll, IPollVote } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import dayjs from 'dayjs';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import classes from './Poll.module.scss';
import { Separator } from '../../Separator';
import { Button } from '../../Button';
import PollVotesListDialog from './PollVotesListDialog';

function Poll({ poll }: { poll: IPoll | null }) {
	const t = useTranslations('PostDetails.Poll');
	const { user } = useUser();
	const router = useRouter();
	const { toast } = useToast();
	const isPollEnded = useMemo(() => dayjs().isAfter(dayjs(poll?.endsAt)), [poll?.endsAt]);
	const [loading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [votes, setVotes] = useState<IPollVote[]>([]);

	// Check if current user has voted
	const userHasVoted = useMemo(() => {
		return user?.id ? votes.some((vote) => vote.userId === user.id) : false;
	}, [votes, user?.id]);

	// Check if votes should be visible (for MASKED polls)
	const shouldShowVotes = useMemo(() => {
		if (!poll?.voteTypes?.includes(EPollVotesType.MASKED)) return true;
		return isPollEnded || userHasVoted;
	}, [poll?.voteTypes, isPollEnded, userHasVoted]);

	const fetchPollVotes = useCallback(async () => {
		const { data, error } = await NextApiClientService.getPollVotes({
			proposalType: poll?.proposalType as EProposalType,
			index: poll?.index.toString() as string,
			pollId: poll?.id as string
		});
		if (error) {
			setVotes([]);
			throw new Error(error?.message || 'Failed to fetch poll votes');
		}

		setVotes(data?.votes || []);
	}, [poll]);

	const { isFetching: isFetchingPollVotes } = useQuery({
		queryKey: ['pollVotes', poll?.id],
		queryFn: () => fetchPollVotes(),
		enabled: !!poll?.id
	});

	const calculateOptionPercentage = useCallback(
		(option: string) => {
			const totalVotes = (votes || []).length;
			if (totalVotes === 0) return 0;

			const optionVotes = (votes || []).filter((vote) => vote.selectedOption === option).length;
			return Number(((optionVotes / totalVotes) * 100).toFixed(0));
		},
		[votes]
	);

	const handleVote = useCallback(
		async (option: string) => {
			setSelectedOption(option);
			if (!option || isPollEnded) return;
			if (!user?.id) {
				router.push('/login');
				return;
			}

			if (votes?.find((vote) => vote.userId === user?.id && vote.selectedOption === option)) {
				setLoading(true);
				const { data, error } = await NextApiClientService.removePollVote({
					proposalType: poll?.proposalType as EProposalType,
					index: poll?.index.toString() as string,
					pollId: poll?.id as string
				});

				if (error || !data) {
					toast({
						title: 'Failed!',
						description: error?.message || 'Failed to remove vote',
						status: ENotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				setVotes((prev) => prev.filter((vote) => vote.userId !== user?.id || vote.selectedOption !== option));
				setLoading(false);
				toast({
					title: 'Success!',
					description: 'Your vote has been removed!',
					status: ENotificationStatus.SUCCESS
				});
				return;
			}

			setLoading(true);
			const { data, error } = await NextApiClientService.addPollVote({
				proposalType: poll?.proposalType as EProposalType,
				index: poll?.index.toString() as string,
				pollId: poll?.id as string,
				decision: option
			});

			if (error || !data) {
				toast({
					title: 'Failed!',
					description: error?.message || 'Failed to vote',
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			setVotes((prev) => [...(prev?.filter((vote) => vote.userId !== user?.id) || []), data.vote]);

			toast({
				title: 'Success!',
				description: 'Your vote has been cast',
				status: ENotificationStatus.SUCCESS
			});
			setLoading(false);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[user?.id, votes, isPollEnded, poll]
	);

	if (!poll) {
		return null;
	}

	return (
		<div className={classes.pollWrapper}>
			<div className={classes.pollHeaderWrapper}>
				{/* ends on */}
				<div className={classes.pollHeader}>
					<div>{isPollEnded ? t('endedOn') : t('endsOn')}:</div>
					<div>{dayjs(poll.endsAt).format('DD MMM YY')}</div>
				</div>

				{/* anonymous votes count if poll not masked or user has voted */}
				{poll?.voteTypes?.includes(EPollVotesType.ANONYMOUS) && shouldShowVotes && (
					<div className={classes.pollHeader}>
						<div>{t('anonVotes')}:</div>
						<div>{votes.length || 0}</div>
					</div>
				)}
			</div>
			<div className={classes.pollHeaderTitle}>{poll.title}</div>
			<Separator
				className={classes.pollSeparator}
				orientation='horizontal'
			/>

			{/* poll options */}
			<div className={classes.pollOptions}>
				{poll?.options?.map((option) => {
					const percentage = calculateOptionPercentage(option);
					return (
						<Button
							disabled={loading && selectedOption !== option}
							isLoading={selectedOption === option && loading}
							onClick={() => handleVote(option)}
							variant='ghost'
							key={option}
							className={cn(
								'relative flex w-full flex-wrap items-center justify-between overflow-hidden break-all rounded-md bg-poll_option_bg px-3 py-2.5 text-xs font-semibold text-text_primary',
								percentage > 0 ? 'text-white' : '',
								isPollEnded && 'cursor-not-allowed'
							)}
						>
							{shouldShowVotes && (
								<div
									className={classes.votePercentageBar}
									style={{ width: `${percentage}%` }}
								/>
							)}

							<span className='relative z-10 flex flex-wrap break-all'>{option}</span>
							<div className='flex flex-wrap items-end gap-1 break-all'>
								{shouldShowVotes && !isFetchingPollVotes && ValidatorService.isValidNumber(percentage) && <span className={classes.votePercentage}>{percentage}%</span>}
							</div>
						</Button>
					);
				})}
			</div>

			{/* view poll votes */}
			{!poll?.voteTypes?.includes(EPollVotesType.ANONYMOUS) && shouldShowVotes && (
				<div className={classes.pollViewVotes}>
					<PollVotesListDialog
						poll={poll}
						votes={votes}
						loading={isFetchingPollVotes}
					/>
				</div>
			)}
		</div>
	);
}

export default Poll;
