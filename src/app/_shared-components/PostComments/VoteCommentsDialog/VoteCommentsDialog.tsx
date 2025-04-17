// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@ui/Dialog/Dialog';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVoteData } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IoCalendarOutline } from 'react-icons/io5';
import Address from '../../Profile/Address/Address';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Table';
import { Collapsible, CollapsibleContent } from '../../Collapsible';
import { Separator } from '../../Separator';

function VoteCommentsDialog({
	voteInfo,
	showVoteDetails,
	setShowVoteDetails
}: {
	voteInfo: IVoteData;
	showVoteDetails: boolean;
	setShowVoteDetails: (showVoteDetails: boolean) => void;
}) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const [expanded, setExpanded] = useState(false);

	const getConvictionText = (lockPeriod: number) => {
		if (lockPeriod === 0) return '0.1x/d';
		return `${lockPeriod}x`;
	};

	const convictionText = t('PostDetails.conviction');
	const votingPowerText = t('PostDetails.votingPower');

	return (
		<Dialog
			open={showVoteDetails}
			onOpenChange={setShowVoteDetails}
		>
			<DialogContent className='max-h-[550px] max-w-2xl overflow-y-auto p-4'>
				<DialogTitle>
					<h2 className='text-xl font-semibold text-text_primary'>{t('PostDetails.votes')}</h2>
				</DialogTitle>
				<Separator orientation='horizontal' />

				{voteInfo && (
					<div className='p-0'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('PostDetails.vote')}</TableHead>
									<TableHead>{t('PostDetails.amount')}</TableHead>
									<TableHead>{convictionText}</TableHead>
									<TableHead>{votingPowerText}</TableHead>
									<TableHead className='w-[50px]' />
								</TableRow>
							</TableHeader>
							<TableBody className={`bg-page_background ${expanded ? 'border-t-2 border-text_pink' : 'border-b border-border_grey'}`}>
								<TableRow
									className='cursor-pointer'
									onClick={() => setExpanded(!expanded)}
								>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Address address={voteInfo.voterAddress} />
										</div>
									</TableCell>
									<TableCell>{formatBnBalance(voteInfo.balanceValue, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</TableCell>
									<TableCell>{getConvictionText(voteInfo.lockPeriod)}</TableCell>
									<TableCell>
										{voteInfo.totalVotingPower && formatBnBalance(voteInfo.totalVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
									</TableCell>
									<TableCell>
										<button
											type='button'
											className='focus:outline-none'
										>
											{expanded ? <ChevronUp className='text-text_secondary h-4 w-4' /> : <ChevronDown className='text-text_secondary h-4 w-4' />}
										</button>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>

						<Collapsible open={expanded}>
							<CollapsibleContent className='border-b-2 border-text_pink pb-4'>
								<div className='px-4'>
									<div className='my-4 border-t border-dotted border-border_grey opacity-70' />
									<div className='mb-2 flex items-center gap-2'>
										<span className='flex items-center gap-1 text-xs font-semibold text-btn_secondary_text'>
											<IoCalendarOutline /> {new Date(voteInfo.createdAt).toLocaleDateString()} {new Date(voteInfo.createdAt).toLocaleTimeString()}
										</span>
										<span className='text-xs text-text_primary'>{votingPowerText}: &lt;1%</span>
									</div>

									<div className='my-4 border-t border-dotted border-border_grey opacity-70' />

									<div>
										<h3 className='mb-4 text-sm font-medium text-btn_secondary_text'>{t('PostDetails.voteBreakdown')}</h3>

										<div className='grid grid-cols-2 gap-8'>
											<div>
												<h4 className='mb-1 text-xs font-medium text-text_primary'>{t('PostDetails.selfVotes')}</h4>
												<div className='flex items-center gap-2 text-xs text-text_primary'>
													<span>{votingPowerText}</span>
													{voteInfo.selfVotingPower && (
														<span className='ml-auto text-btn_secondary_text'>
															{formatBnBalance(voteInfo.selfVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
														</span>
													)}
												</div>
												<div className='flex items-center gap-2 text-xs text-text_primary'>
													<span>{convictionText}</span>
													<span className='ml-auto text-btn_secondary_text'>{getConvictionText(voteInfo.lockPeriod)}</span>
												</div>
												<div className='flex items-center gap-2 text-xs text-text_primary'>
													<span>{t('PostDetails.capital')}</span>
													{voteInfo.balanceValue && (
														<span className='ml-auto text-btn_secondary_text'>
															{formatBnBalance(voteInfo.balanceValue?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
														</span>
													)}
												</div>
											</div>

											{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
												<div>
													<h4 className='mb-1 text-xs font-medium text-text_primary'>{t('PostDetails.delegatedVotes')}</h4>
													<div className='flex items-center gap-2 text-xs text-text_primary'>
														<span>{votingPowerText}</span>
														{voteInfo.delegatedVotingPower && (
															<span className='ml-auto text-btn_secondary_text'>
																{formatBnBalance(voteInfo.delegatedVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
															</span>
														)}
													</div>
													<div className='flex items-center gap-2 text-xs text-text_primary'>
														<span>{t('PostDetails.delegators')}</span>
														<span className='ml-auto text-btn_secondary_text'>{voteInfo.delegatedVotes.length}</span>
													</div>
													<div className='flex items-center gap-2 text-xs text-text_primary'>
														<span>{t('PostDetails.capital')}</span>
														{voteInfo.delegatedVotes.reduce((sum, vote) => sum + Number(vote.balanceValue || 0), 0) && (
															<span className='ml-auto text-btn_secondary_text'>
																{formatBnBalance(
																	voteInfo.delegatedVotes.reduce((sum, vote) => sum + Number(vote.balanceValue || 0), 0).toString(),
																	{ withUnit: true, numberAfterComma: 2, compactNotation: true },
																	network
																)}
															</span>
														)}
													</div>
												</div>
											)}
										</div>
									</div>

									{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
										<>
											<div className='my-4 border-t border-dotted border-border_grey opacity-70' />

											<div className='mt-4'>
												<h3 className='mb-2 text-sm font-medium text-btn_secondary_text'>{t('PostDetails.delegationList')}</h3>

												<Table className='text-xs'>
													<TableHeader>
														<TableRow>
															<TableHead className='text-text_primary'>{t('PostDetails.delegators')}</TableHead>
															<TableHead className='text-text_primary'>{t('PostDetails.amount')}</TableHead>
															<TableHead className='text-text_primary'>{convictionText}</TableHead>
															<TableHead className='text-text_primary'>{votingPowerText}</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{voteInfo.delegatedVotes.map((delegatedVote) => (
															<TableRow key={delegatedVote.voterAddress}>
																<TableCell>
																	<div className='flex items-center gap-2'>
																		<Address address={delegatedVote.voterAddress} />
																	</div>
																</TableCell>
																<TableCell>
																	{delegatedVote.balanceValue &&
																		formatBnBalance(delegatedVote.balanceValue?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
																</TableCell>
																<TableCell>{getConvictionText(delegatedVote.lockPeriod)}</TableCell>
																<TableCell>
																	{delegatedVote.totalVotingPower &&
																		formatBnBalance(delegatedVote.totalVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default VoteCommentsDialog;
