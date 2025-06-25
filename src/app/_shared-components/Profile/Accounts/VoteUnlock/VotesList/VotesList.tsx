// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo } from 'react';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVoteLock, ENetwork } from '@/_shared/types';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import classes from './VotesList.module.scss';
import VoteDetailCard from '../VoteDetailCard/VoteDetailCard';

interface VotesListProps {
	votingLocks: IVoteLock[];
	balance: BN;
	balanceLabel: string;
	icon: React.ReactNode;
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

function VotesList({ votingLocks, balance, balanceLabel, icon }: VotesListProps) {
	const network = getCurrentNetwork();
	const hasVotes = votingLocks.length > 0;

	// Memoize vote cards to prevent unnecessary re-renders
	const voteCards = useMemo(
		() =>
			votingLocks.map((vote) => (
				<React.Fragment key={vote.refId}>
					<Separator className='my-0' />
					<VoteDetailCard vote={vote} />
				</React.Fragment>
			)),
		[votingLocks]
	);

	const titleProps = {
		balanceLabel,
		icon,
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

export default VotesList;
