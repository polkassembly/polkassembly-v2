// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { useState, Fragment, useMemo } from 'react';
import { CheckCircle2, XCircle, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import AbstainIcon from '@assets/icons/abstainGray.svg';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import listingStyles from '@/app/_shared-components/ListingComponent/ListingCard/ListingCard.module.scss';
import { EProposalStatus, IDelegateXVoteData } from '@/_shared/types';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';

interface IVotingHistoryTableProps {
	votingHistory: (IDelegateXVoteData & { status: EProposalStatus })[];
}

function VotingHistoryTable({ votingHistory }: IVotingHistoryTableProps) {
	const [expandedRow, setExpandedRow] = useState<number | null>(null);

	const transformedVotingHistory = useMemo(
		() =>
			votingHistory.map((vote) => ({
				id: parseInt(vote.proposalId, 10),
				title: `Proposal ${vote.proposalId}`,
				track: vote.proposalType,
				decision: vote.decision === 1 ? 'Aye' : vote.decision === 0 ? 'Nay' : 'Abstain',
				timestamp: new Date(vote.createdAt).toLocaleDateString(),
				status: vote.status,
				criteria: vote.reason.map((r, idx) => ({ met: idx < 3, text: r })),
				keyReason: vote.comment || vote.reason[0] || '',
				commentUrl: `https://polkadot.polkassembly.io/referenda/${vote.proposalId}`
			})),
		[votingHistory]
	);

	return (
		<div className='overflow-hidden rounded-2xl border border-border_grey bg-bg_modal'>
			<div className='hidden px-4 pt-4 md:block'>
				<Table className='w-full border-t border-border_grey'>
					<TableHeader className='bg-page_background'>
						<TableRow className='border-b border-border_grey hover:bg-transparent'>
							<TableHead className='px-3 py-3 text-text_primary md:px-4 md:py-4 md:pr-6'>REFERENDUM</TableHead>
							<TableHead className='px-3 py-3 text-text_primary md:px-4 md:py-4 md:pr-6'>TRACK</TableHead>
							<TableHead className='px-3 py-3 text-text_primary md:px-4 md:py-4 md:pr-6'>DECISION</TableHead>
							<TableHead className='px-3 py-3 text-text_primary md:px-4 md:py-4 md:pr-6'>TIMESTAMP</TableHead>
							<TableHead className='px-3 py-3 text-text_primary md:px-4 md:py-4 md:pr-6'>STATUS</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{transformedVotingHistory.map((row, idx) => (
							<Fragment key={row.id}>
								<TableRow className='cursor-pointer border-b border-border_grey last:border-b-0 hover:bg-bg_modal'>
									<TableCell className='max-w-40 px-6 py-4 font-medium'>
										#{row.id} {row.title}
									</TableCell>
									<TableCell className='px-6 py-4'>
										<span className={`${getSpanStyle(row.track || '', 1)} ${listingStyles.originStyle}`}>{convertCamelCaseToTitleCase(row.track || '')}</span>
									</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center gap-2'>
											{row.decision === 'Aye' && <AiFillLike className='h-5 w-5 text-social_green' />}
											{row.decision === 'Nay' && <AiFillDislike className='h-5 w-5 text-toast_error_text' />}
											{row.decision === 'Abstain' && (
												<Image
													src={AbstainIcon}
													alt='abstain'
													width={20}
													height={20}
												/>
											)}
											{row.decision === '-' && <span className='font-bold text-wallet_btn_text'>-</span>}
											<span className='font-medium'>{row.decision}</span>
										</div>
									</TableCell>
									<TableCell className='text-text_secondary px-6 py-4'>{row.timestamp}</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center justify-between'>
											<StatusTag status={row.status} />
											<Button
												onClick={(e) => {
													e.stopPropagation();
													setExpandedRow(expandedRow === idx ? null : idx);
												}}
												variant='ghost'
											>
												<Menu className='text-text-primary h-5 w-5' />
											</Button>
										</div>
									</TableCell>
								</TableRow>

								{expandedRow === idx && (
									<TableRow>
										<TableCell
											colSpan={5}
											className='bg-page_background p-6'
										>
											<div className='mb-4 flex items-center justify-between'>
												<span className='text-sm font-semibold text-wallet_btn_text'>CRITERIA CHECKLIST: (3/5)</span>
												<a
													href={row.commentUrl}
													target='_blank'
													rel='noopener noreferrer'
													className='text-xs font-semibold text-text_pink hover:underline'
												>
													VIEW COMMENT ON POLKASSEMBLY
												</a>
											</div>
											<ul className='space-y-2'>
												{row.criteria.map((c) => (
													<li
														key={c.text}
														className='flex items-center gap-3 text-sm'
													>
														{c.met ? <CheckCircle2 className='h-5 w-5 text-social_green' /> : <XCircle className='h-5 w-5 text-toast_error_text' />}
														<span className='text-text_primary'>{c.text}</span>
													</li>
												))}
											</ul>
											<div className='mt-4 rounded-lg border border-klara_active_chat_border bg-bg_modal px-4 py-3 text-sm'>
												<span className='font-semibold text-wallet_btn_text'>Key Reason:</span> <span className='text-text_primary'>{row.keyReason}</span>
											</div>
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						))}
					</TableBody>
				</Table>
			</div>

			<div className='md:hidden'>
				{transformedVotingHistory.map((row, idx) => (
					<div
						key={row.id}
						className='border-b border-border_grey bg-bg_modal last:border-b-0'
					>
						<div className='flex cursor-pointer items-center justify-between px-4 py-4'>
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-3'>
									<span className='text-lg font-semibold text-text_primary'>#{row.id}</span>
									<StatusTag status={row.status} />
								</div>
								<p className='mt-1 max-w-60 truncate font-medium text-text_primary'>{row.title}</p>
								<div className='text-text_secondary mt-3 flex items-center gap-4 text-sm'>
									<span className={`${getSpanStyle(row.track || '', 1)} ${listingStyles.originStyle} rounded px-2 py-0.5`}>{convertCamelCaseToTitleCase(row.track || '')}</span>
									<div className='flex items-center gap-1.5'>
										{row.decision === 'Aye' && <AiFillLike className='h-4 w-4 text-social_green' />}
										{row.decision === 'Nay' && <AiFillDislike className='h-4 w-4 text-toast_error_text' />}
										{row.decision === 'Abstain' && (
											<Image
												src={AbstainIcon}
												alt='abstain'
												width={16}
												height={16}
											/>
										)}
										<span className='font-medium'>{row.decision}</span>
									</div>
									<span className='text-xs'>{row.timestamp}</span>
								</div>
							</div>
							<Button
								variant='ghost'
								onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
								className='ml-2'
							>
								{expandedRow === idx ? <ChevronUp className='h-6 w-6 text-sidebar_text' /> : <ChevronDown className='h-6 w-6 text-sidebar_text' />}
							</Button>
						</div>

						{expandedRow === idx && (
							<div className='border-t border-border_grey bg-page_background px-4 pb-5'>
								<div className='mb-4 flex items-center justify-between pt-4'>
									<span className='text-sm font-semibold text-wallet_btn_text'>CRITERIA CHECKLIST: (3/5)</span>
									<a
										href={row.commentUrl}
										target='_blank'
										rel='noopener noreferrer'
										className='text-xs font-semibold text-text_pink hover:underline'
									>
										VIEW COMMENT
									</a>
								</div>
								<ul className='mb-4 space-y-2'>
									{row.criteria.map((c) => (
										<li
											key={c.text}
											className='flex items-start gap-3 text-sm'
										>
											{c.met ? <CheckCircle2 className='mt-0.5 h-5 w-5 text-social_green' /> : <XCircle className='mt-0.5 h-5 w-5 text-toast_error_text' />}
											<span className='text-text_primary'>{c.text}</span>
										</li>
									))}
								</ul>
								<div className='rounded-lg border border-klara_active_chat_border bg-bg_modal px-4 py-3 text-sm'>
									<span className='font-semibold text-wallet_btn_text'>Key Reason:</span> <span className='text-text_primary'>{row.keyReason}</span>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default VotingHistoryTable;
