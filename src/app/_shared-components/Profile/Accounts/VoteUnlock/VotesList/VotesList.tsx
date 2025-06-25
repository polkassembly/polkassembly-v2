// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
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

function VoteListTitle({
	balanceLabel,
	icon,
	balance,
	network,
	withChevron = false
}: {
	balanceLabel: string;
	icon: React.ReactNode;
	balance: BN;
	network: ENetwork;
	withChevron?: boolean;
}) {
	return (
		<div className={classes.sectionTitle}>
			<div className={classes.titleIcon}>
				{icon}
				<span className={classes.titleLabel}>{balanceLabel}</span>
			</div>
			<div className='flex items-center gap-2'>
				<span className={classes.balanceValue}>{formatBnBalance(balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</span>
				{withChevron && <ChevronDown className='text-lg font-semibold text-text_primary' />}
			</div>
		</div>
	);
}

function VotesList({ votingLocks, balance, balanceLabel, icon }: VotesListProps) {
	const network = getCurrentNetwork();

	return votingLocks.length === 0 ? (
		<VoteListTitle
			balanceLabel={balanceLabel}
			icon={icon}
			balance={balance}
			network={network}
		/>
	) : (
		<Collapsible
			className={classes.container}
			defaultOpen
		>
			<CollapsibleTrigger>
				<VoteListTitle
					balanceLabel={balanceLabel}
					icon={icon}
					balance={balance}
					network={network}
					withChevron
				/>
			</CollapsibleTrigger>
			<CollapsibleContent className={classes.collapsibleContent}>
				{votingLocks.length > 0 &&
					votingLocks.map((vote) => (
						<>
							<Separator className='my-0' />
							<VoteDetailCard
								key={vote.refId}
								vote={vote}
							/>
						</>
					))}
			</CollapsibleContent>
		</Collapsible>
	);
}

export default VotesList;
