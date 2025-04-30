// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EVoteDecision, IPostWithDelegateVote } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { Separator } from '@/app/_shared-components/Separator';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useTranslations } from 'next-intl';
import { IoIosInformationCircleOutline } from '@react-icons/all-files/io/IoIosInformationCircleOutline';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import styles from './DelegationTrack/DelegationTrack.module.scss';

interface ActiveProposalsProps {
	activeProposals: IPostWithDelegateVote[];
}

export function ActiveProposals({ activeProposals }: ActiveProposalsProps) {
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');

	const getTimeRemaining = (endDate: string) => {
		const timeLeft = new Date(endDate).getTime() - new Date().getTime();
		if (timeLeft <= 0) {
			return null;
		}
		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		return `${days} d : ${hours} h : ${minutes} m Remaining`;
	};

	const renderProposalTimeInfo = (proposal: IPostWithDelegateVote) => {
		return (
			<>
				{proposal.onChainInfo?.createdAt && (
					<div className='hidden items-center gap-1.5 whitespace-nowrap text-text_primary md:flex'>
						<Separator
							orientation='vertical'
							className='h-4'
						/>
						<FaRegClock className='text-sm' />
						<span className={styles.proposalLabel}>{dayjs(proposal.onChainInfo?.createdAt).fromNow()}</span>
					</div>
				)}
				{proposal.onChainInfo?.decisionPeriodEndsAt && getTimeRemaining(proposal.onChainInfo.decisionPeriodEndsAt.toString()) && (
					<div className='flex items-center gap-1.5 whitespace-nowrap text-text_primary'>
						<Separator
							orientation='vertical'
							className='hidden h-4 md:block'
						/>
						<FaRegClock className='text-sm text-btn_secondary_text' />
						<span className='text-xs text-btn_secondary_text'>{getTimeRemaining(proposal.onChainInfo.decisionPeriodEndsAt.toString())}</span>
					</div>
				)}
			</>
		);
	};

	return (
		<Collapsible
			defaultOpen
			className={cn(styles.proposalsContainer)}
		>
			<CollapsibleTrigger className={styles.proposalsHeader}>
				<div className={styles.proposalsTitle}>
					<p className={styles.delegationTrackName}>{t('activeProposals')}</p>
					<span className={styles.proposalsCount}>{activeProposals.length}</span>
				</div>

				<ChevronDown className={cn('h-6 w-6')} />
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div className={styles.proposalsList}>
					{activeProposals.length > 0 ? (
						activeProposals
							.sort((a, b) => (b.index ?? 0) - (a.index ?? 0))
							.map((proposal: IPostWithDelegateVote) => (
								<Link
									href={`/referenda/${proposal.index}`}
									className={styles.proposalCard}
								>
									<div className={styles.proposalDetails}>
										<div className='flex items-center gap-2 md:hidden'>
											<span className={styles.proposalLabel}>{t('by')}: </span>
											<div className='flex items-center gap-1 pl-1'>{proposal.onChainInfo?.proposer && <Address address={proposal.onChainInfo?.proposer} />}</div>
											{proposal.onChainInfo?.createdAt && (
												<div className='flex items-center gap-1.5 whitespace-nowrap text-text_primary md:hidden'>
													<Separator
														orientation='vertical'
														className='h-4'
													/>
													<FaRegClock className='text-sm' />
													<span className={styles.proposalLabel}>{dayjs(proposal.onChainInfo?.createdAt).fromNow()}</span>
												</div>
											)}
										</div>
										<div className='flex justify-between'>
											<div>
												<p className={styles.proposalTitle}>
													#{proposal.index} {proposal.title}
												</p>
											</div>
										</div>
										<div className={styles.proposalInfo}>
											<div className='hidden md:flex'>
												<span className={styles.proposalLabel}>{t('by')}: </span>
												<div className='flex items-center gap-1 pl-2'>{proposal.onChainInfo?.proposer && <Address address={proposal.onChainInfo?.proposer} />}</div>
											</div>
											{renderProposalTimeInfo(proposal)}
										</div>
									</div>
									<div
										className={cn(
											styles.voteInfo,
											proposal?.delegateVote?.decision === EVoteDecision.AYE && styles.aye,
											proposal?.delegateVote?.decision === EVoteDecision.NAY && styles.nay,
											proposal?.delegateVote?.decision === EVoteDecision.SPLIT && styles.split,
											proposal?.delegateVote?.decision === EVoteDecision.SPLIT_ABSTAIN && styles.splitAbstain,
											!proposal?.delegateVote?.decision && styles.notVoted
										)}
									>
										<span className={styles.proposalLabel}>
											{proposal?.delegateVote?.decision === EVoteDecision.AYE && t('votedAye')}
											{proposal?.delegateVote?.decision === EVoteDecision.NAY && t('votedNay')}
											{proposal?.delegateVote?.decision === EVoteDecision.SPLIT && t('votedSplit')}
											{proposal?.delegateVote?.decision === EVoteDecision.SPLIT_ABSTAIN && t('votedSplitAbstain')}
											{!proposal?.delegateVote?.decision && t('notVotedYet')}
											{proposal?.delegateVote?.decision && (
												<div className='flex items-center gap-2'>
													<Separator
														orientation='vertical'
														className='h-4'
													/>
													{t('balance')}: {formatBnBalance(proposal?.delegateVote?.balanceValue, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
													<Separator
														orientation='vertical'
														className='h-4'
													/>
													{t('conviction')}: {proposal?.delegateVote?.lockPeriod}x
												</div>
											)}
										</span>
										{!proposal?.delegateVote?.decision && <IoIosInformationCircleOutline className='text-lg text-warning' />}
									</div>
								</Link>
							))
					) : (
						<div className={styles.noProposalsMessage}>{t('noActiveProposalsFoundForThisTrack')}</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
