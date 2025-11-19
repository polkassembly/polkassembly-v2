// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { useState, Fragment } from 'react';
import { CheckCircle2, XCircle, Menu } from 'lucide-react';
import AbstainIcon from '@assets/icons/abstainGray.svg';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import listingStyles from '@/app/_shared-components/ListingComponent/ListingCard/ListingCard.module.scss';
import { EProposalStatus } from '@/_shared/types';
import Image from 'next/image';

interface IVotingHistoryTableProps {
	votingHistory: {
		id: number;
		title: string;
		track: string;
		decision: string;
		decisionIcon: string;
		timestamp: string;
		status: EProposalStatus;
		criteria: { met: boolean; text: string }[];
		keyReason: string;
		commentUrl: string;
		expanded: boolean;
	}[];
}

function VotingHistoryTable({ votingHistory }: IVotingHistoryTableProps) {
	const [expandedRow, setExpandedRow] = useState<number | null>(null);

	return (
		<div className='rounded-2xl border border-border_grey bg-bg_modal'>
			<div className='px-3 pt-3'>
				<Table className='w-full border-t border-border_grey'>
					<TableHeader className='bg-page_background'>
						<TableRow className='border-b border-border_grey hover:bg-transparent'>
							<TableHead className='!px-0 !py-4 text-text_primary first:pl-6 last:pr-6'>REFERENDUM</TableHead>
							<TableHead className='!px-0 !py-4 text-text_primary first:pl-6 last:pr-6'>TRACK</TableHead>
							<TableHead className='!px-0 !py-4 text-text_primary first:pl-6 last:pr-6'>DECISION</TableHead>
							<TableHead className='!px-0 !py-4 text-text_primary first:pl-6 last:pr-6'>TIMESTAMP</TableHead>
							<TableHead className='!px-0 !py-4 text-text_primary first:pl-6 last:pr-6'>STATUS</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{votingHistory.map((row, idx) => (
							<Fragment key={row.id}>
								<TableRow className='cursor-pointer border-b border-border_grey last:border-b-0 hover:bg-bg_modal'>
									<TableCell className='px-6 py-4'>
										<span className='line-clamp-1 font-medium'>
											#{row.id} {row.title}
										</span>
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
													className='h-5 w-5'
													width={24}
													height={24}
												/>
											)}
											{row.decision === '-' && <span className='font-bold text-wallet_btn_text'>-</span>}
											<span className='font-medium'>{row.decision}</span>
										</div>
									</TableCell>
									<TableCell className='px-6 py-4'>{row.timestamp}</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center justify-between'>
											<StatusTag status={row.status} />
											<Menu
												className='text-sidebar_text'
												onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
											/>
										</div>
									</TableCell>
								</TableRow>
								{expandedRow === idx && (
									<TableRow>
										<TableCell
											colSpan={5}
											className='bg-page_background p-6'
										>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-semibold text-wallet_btn_text'>CRITERIA CHECKLIST: (3/5)</span>
												<a
													href={row.commentUrl}
													target='_blank'
													rel='noopener noreferrer'
													className='text-xs font-semibold text-text_pink underline'
												>
													VIEW COMMENT ON POLKASSEMBLY
												</a>
											</div>
											<ul className='space-y-1 py-3'>
												{row.criteria.map((c) => (
													<li
														key={c.text}
														className='flex items-center gap-2 text-sm'
													>
														{c.met ? <CheckCircle2 className='h-5 w-5 text-social_green' /> : <XCircle className='h-5 w-5 text-toast_error_text' />}
														<span className='text-text_primary'>{c.text}</span>
													</li>
												))}
											</ul>

											<div className='rounded-lg border border-klara_active_chat_border bg-bg_modal px-4 py-2 text-sm text-wallet_btn_text'>
												<span className='font-semibold'>Key Reason:</span> {row.keyReason}
											</div>
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default VotingHistoryTable;
