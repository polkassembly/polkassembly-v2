// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EVoteDecision, IUserVote } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ViewSubscanIcon from '@assets/icons/profile-subscan.svg';
import ViewVoteIcon from '@assets/profile/view-vote.svg';
import Image from 'next/image';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import SplitAbstainImg from '@assets/icons/abstainGray.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN_ZERO } from '@polkadot/util';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useState } from 'react';
import LoadingLayover from '../../LoadingLayover';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../Table';
import StatusTag from '../../StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../Tooltip';
import VoteDetailsDialog from './VoteDetailsDialog';
import { Button } from '../../Button';
import classes from './Votes.module.scss';

interface IBalance {
	aye?: string;
	nay?: string;
	abstain?: string;
	value?: string;
}

function VoteDecisionDisplay({ userVoteDecision, balance, network }: { userVoteDecision: EVoteDecision | null; balance: IBalance; network: ENetwork }) {
	const t = useTranslations();
	const votedText = t('PostDetails.voted');

	switch (userVoteDecision) {
		case EVoteDecision.AYE:
			return (
				<div className={classes.voteDecisionDisplay}>
					<AiFillLike className='text-base text-success' />
					<span className='font-medium text-success'>{formatBnBalance(balance?.value || BN_ZERO.toString(), { numberAfterComma: 1, withUnit: true }, network)}</span>
				</div>
			);
		case EVoteDecision.NAY:
			return (
				<div className={classes.voteDecisionDisplay}>
					<AiFillDislike className='text-base text-failure' />
					<span className='font-medium text-failure'>
						<span className='font-medium text-failure'>{formatBnBalance(balance?.value || BN_ZERO.toString(), { numberAfterComma: 1, withUnit: true }, network)}</span>
					</span>
				</div>
			);
		case EVoteDecision.ABSTAIN:
			return (
				<div className='flex flex-col items-start justify-start gap-y-1'>
					<div className='flex items-center justify-start gap-x-1'>
						<AiFillLike className='text-base text-success' />
						<span className='font-medium text-success'>{formatBnBalance(balance?.aye || BN_ZERO.toString(), { numberAfterComma: 1, withUnit: true }, network)}</span>
					</div>
					<div className='flex items-center justify-start gap-x-1'>
						<AiFillDislike className='text-base text-failure' />
						<span className='font-medium text-failure'>{formatBnBalance(balance?.nay || BN_ZERO.toString(), { numberAfterComma: 1, withUnit: true }, network)}</span>
					</div>
					<div className='flex items-center justify-start gap-x-1'>
						<Image
							src={SplitAbstainImg}
							alt='split abstain'
							width={14}
							height={14}
						/>
						<span className='font-medium text-toast_info_text'>{formatBnBalance(balance?.abstain || BN_ZERO.toString(), { numberAfterComma: 1, withUnit: true }, network)}</span>
					</div>
				</div>
			);
		default:
			return (
				<span className='font-medium text-text_primary'>
					{votedText} {userVoteDecision}
				</span>
			);
	}
}
function VotesTable({ isFetching, votes }: { isFetching: boolean; votes: IUserVote[] }) {
	const t = useTranslations('Profile');
	const network = getCurrentNetwork();
	const [isDialogOpen, setIsDialogOpen] = useState<{ row: IUserVote | null; isOpen: boolean }>({ row: null, isOpen: false });

	return (
		<div>
			<Table className={classes.votesTable}>
				{isFetching && <LoadingLayover />}
				<TableHeader>
					<TableRow className={classes.votesTableHeaderRow}>
						<TableHead className='py-4'>#</TableHead>
						<TableHead className='py-4'>{t('Votes.proposal')}</TableHead>
						<TableHead className='py-4'>{t('Votes.vote')}</TableHead>
						<TableHead className='py-4'>{t('Votes.status')}</TableHead>
						<TableHead className='py-4'>{t('Votes.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{votes && votes.length > 0 ? (
						votes.map((row) => (
							<TableRow key={row.proposalIndex}>
								<TableCell className='py-4'>
									<Link
										href={`/post/${row.proposalIndex}`}
										key={row.proposalIndex}
										className={classes.votesTableLink}
									>
										#{row.proposalIndex}
									</Link>
								</TableCell>
								<TableCell className='max-w-[300px] truncate py-4'>
									<Link
										href={`/referenda/${row.proposalIndex}`}
										key={row.proposalIndex}
										className={classes.votesTableLink}
										target='_blank'
									>
										{row.postDetails?.title}
									</Link>
								</TableCell>
								<TableCell className='py-4'>
									<VoteDecisionDisplay
										userVoteDecision={row.decision}
										balance={row.balance as IBalance}
										network={network}
									/>
								</TableCell>
								<TableCell className='py-4'>
									<StatusTag
										className='w-max'
										status={row.postDetails.onChainInfo?.status}
									/>
								</TableCell>
								<TableCell className='py-4'>
									<div className='flex items-center gap-x-1'>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Link
														target='_blank'
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
														}}
														href={`https://polkadot.subscan.io/extrinsic/${row?.extrinsicIndex}`}
													>
														<Image
															src={ViewSubscanIcon}
															alt='View Subscan'
															width={24}
															height={24}
														/>
													</Link>
												</TooltipTrigger>
												<TooltipContent
													side='top'
													align='center'
													className={classes.tooltipContent}
												>
													{t('Votes.viewSubscan')}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant='ghost'
														onClick={() => {
															setIsDialogOpen({ row, isOpen: true });
														}}
													>
														<Image
															src={ViewVoteIcon}
															alt='View Vote'
															width={24}
															height={24}
														/>
													</Button>
												</TooltipTrigger>
												<TooltipContent
													side='top'
													align='center'
													className={classes.tooltipContent}
												>
													{t('Votes.viewVote')}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow className='h-48'>
							<TableCell
								colSpan={6}
								className='text-center'
							>
								{t('Votes.noVotes')}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{isDialogOpen?.row && (
				<VoteDetailsDialog
					isDialogOpen={isDialogOpen?.isOpen}
					setIsDialogOpen={(isOpen) => setIsDialogOpen({ row: isDialogOpen?.row, isOpen })}
					voteData={isDialogOpen?.row}
				/>
			)}
		</div>
	);
}

export default VotesTable;
