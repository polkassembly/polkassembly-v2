// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo } from 'react';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVoteLock, ENetwork } from '@/_shared/types';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { useTranslations } from 'next-intl';
import classes from './UnlockVotesList.module.scss';
import UnlockVoteDetailCard from '../UnlockVoteDetailCard/UnlockVoteDetailCard';

interface UnlockVotesListProps {
	votingLocks: IVoteLock[];
	balance: BN;
	selectedVotes?: Set<string>;
	onVoteSelectionChange?: (vote: IVoteLock, selected: boolean) => void;
}

interface VoteListTitleProps {
	balanceLabel: string;
	icon: React.ReactNode;
	balance: BN;
	network: ENetwork;
	withChevron?: boolean;
}

function VoteListTitle({ balanceLabel, icon, balance, network, withChevron = false }: VoteListTitleProps) {
	// Memoize balance formatting to prevent unnecessary recalculations
	const formattedBalance = useMemo(() => formatBnBalance(balance.toString(), { numberAfterComma: 2, withUnit: true }, network), [balance, network]);

	return (
		<div className={classes.sectionTitle}>
			<div className={classes.titleIcon}>
				{icon}
				<span className={classes.titleLabel}>{balanceLabel}</span>
			</div>
			<div className='flex items-center gap-2'>
				<span className={classes.balanceValue}>{formattedBalance}</span>
				{withChevron && <ChevronDown className='text-lg font-semibold text-text_primary' />}
			</div>
		</div>
	);
}

function UnlockVotesList({ votingLocks, balance, selectedVotes, onVoteSelectionChange }: UnlockVotesListProps) {
	const network = getCurrentNetwork();
	const hasVotes = votingLocks.length > 0;
	const t = useTranslations();

	// Create a unique key for each vote to track selection
	const getVoteKey = (vote: IVoteLock) => `${vote.refId}-${vote.track}`;

	// Memoize vote cards to prevent unnecessary re-renders
	const voteCards = useMemo(
		() =>
			votingLocks.map((vote) => {
				const voteKey = getVoteKey(vote);
				const isSelected = selectedVotes ? selectedVotes.has(voteKey) : true;

				return (
					<React.Fragment key={voteKey}>
						<Separator className='my-0' />
						<UnlockVoteDetailCard
							vote={vote}
							isSelected={isSelected}
							onSelectionChange={onVoteSelectionChange}
						/>
					</React.Fragment>
				);
			}),
		[votingLocks, selectedVotes, onVoteSelectionChange]
	);

	const titleProps = {
		balanceLabel: t('Profile.Unlockable'),
		icon: (
			<CheckCircle
				fill='#51D36E'
				className='h-5 w-5 text-info_bg'
			/>
		),
		balance,
		network
	};

	if (!hasVotes) {
		return <VoteListTitle {...titleProps} />;
	}

	return (
		<Collapsible className={classes.container}>
			<CollapsibleTrigger>
				<VoteListTitle
					{...titleProps}
					withChevron
				/>
			</CollapsibleTrigger>
			<CollapsibleContent className={classes.collapsibleContent}>{voteCards}</CollapsibleContent>
		</Collapsible>
	);
}

export default UnlockVotesList;
