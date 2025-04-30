// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useState, memo, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVoteData } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IoCalendarOutline } from '@react-icons/all-files/io5/IoCalendarOutline';
import Address from '../../Profile/Address/Address';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Table';
import { Collapsible, CollapsibleContent } from '../../Collapsible';
import { Separator } from '../../Separator';
import styles from './VoteComments.module.scss';
import VoteDetailsButton from './VoteDetailsButton/VoteDetailsButton';

function VoteComments({ voteInfo }: { voteInfo: IVoteData }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);

	const handleOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setExpanded(false);
		}
	}, []);

	const getConvictionText = (lockPeriod: number) => {
		if (!lockPeriod || lockPeriod === 0) return '0.1x/d';
		return `${lockPeriod}x`;
	};

	const convictionText = t('PostDetails.conviction');
	const votingPowerText = t('PostDetails.votingPower');

	const formatBalanceOptions = {
		withUnit: true,
		numberAfterComma: 2,
		compactNotation: true
	};

	return (
		<Dialog onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<VoteDetailsButton userVoteDecision={voteInfo.decision} />
			</DialogTrigger>
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
									onClick={toggleExpanded}
								>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Address address={voteInfo.voterAddress} />
										</div>
									</TableCell>
									<TableCell>{formatBnBalance(voteInfo.balanceValue, formatBalanceOptions, network)}</TableCell>
									<TableCell>{getConvictionText(voteInfo.lockPeriod)}</TableCell>
									<TableCell>{voteInfo.totalVotingPower && formatBnBalance(voteInfo.totalVotingPower?.toString(), formatBalanceOptions, network)}</TableCell>
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
									<div className={styles.separator} />
									<div className='mb-2 flex items-center gap-2'>
										<span className={styles.calendartext}>
											<IoCalendarOutline /> {new Date(voteInfo.createdAt).toLocaleDateString()} {new Date(voteInfo.createdAt).toLocaleTimeString()}
										</span>
										<span className='text-xs text-text_primary'>{votingPowerText}: &lt;1%</span>
									</div>

									<div className={styles.separator} />

									<div>
										<h3 className={styles.postvotebreakdown}>{t('PostDetails.voteBreakdown')}</h3>

										<div className='grid grid-cols-2 gap-8'>
											<div>
												<h4 className={styles.postvotetext}>{t('PostDetails.selfVotes')}</h4>
												<div className={styles.postvotetext}>
													<span>{votingPowerText}</span>
													{voteInfo.selfVotingPower && (
														<span className={styles.valuelabel}>{formatBnBalance(voteInfo.selfVotingPower?.toString(), formatBalanceOptions, network)}</span>
													)}
												</div>
												<div className={styles.postvotetext}>
													<span>{convictionText}</span>
													<span className={styles.valuelabel}>{getConvictionText(voteInfo.lockPeriod)}</span>
												</div>
												<div className={styles.postvotetext}>
													<span>{t('PostDetails.capital')}</span>
													{voteInfo.balanceValue && <span className={styles.valuelabel}>{formatBnBalance(voteInfo.balanceValue?.toString(), formatBalanceOptions, network)}</span>}
												</div>
											</div>

											{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
												<div>
													<h4 className={styles.postvotedelegatebreakdown}>{t('PostDetails.delegatedVotes')}</h4>
													<div className={styles.postvotetext}>
														<span>{votingPowerText}</span>
														{voteInfo.delegatedVotingPower && (
															<span className={styles.valuelabel}>{formatBnBalance(voteInfo.delegatedVotingPower?.toString(), formatBalanceOptions, network)}</span>
														)}
													</div>
													<div className={styles.postvotetext}>
														<span>{t('PostDetails.delegators')}</span>
														<span className={styles.valuelabel}>{voteInfo.delegatedVotes.length}</span>
													</div>
													<div className={styles.postvotetext}>
														<span>{t('PostDetails.capital')}</span>
														{voteInfo.delegatedVotes?.reduce((sum, vote) => sum + Number(vote?.balanceValue), 0) && (
															<span className={styles.valuelabel}>
																{formatBnBalance(voteInfo.delegatedVotes?.reduce((sum, vote) => sum + Number(vote?.balanceValue), 0).toString(), formatBalanceOptions, network)}
															</span>
														)}
													</div>
												</div>
											)}
										</div>
									</div>

									{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
										<>
											<div className={styles.separator} />

											<div className='mt-4'>
												<h3 className={styles.delegationlist}>{t('PostDetails.delegationList')}</h3>
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead className={styles.tablecelltext}>{t('PostDetails.delegators')}</TableHead>
															<TableHead className={styles.tablecelltext}>{t('PostDetails.amount')}</TableHead>
															<TableHead className={styles.tablecelltext}>{convictionText}</TableHead>
															<TableHead className={styles.tablecelltext}>{votingPowerText}</TableHead>
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
																<TableCell>{delegatedVote.balanceValue && formatBnBalance(delegatedVote.balanceValue?.toString(), formatBalanceOptions, network)}</TableCell>
																<TableCell>{getConvictionText(delegatedVote.lockPeriod)}</TableCell>
																<TableCell>
																	{delegatedVote.totalVotingPower && formatBnBalance(delegatedVote.totalVotingPower?.toString(), formatBalanceOptions, network)}
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

export default memo(VoteComments);
