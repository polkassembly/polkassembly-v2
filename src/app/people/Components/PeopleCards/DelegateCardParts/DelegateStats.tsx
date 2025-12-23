// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, IDelegateDetails } from '@/_shared/types';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import styles from '../PeopleCard.module.scss';

interface DelegateStatsProps {
	delegate: IDelegateDetails;
	network: ENetwork;
	t: (key: string) => string;
}

function DelegateStats({ delegate, network, t }: DelegateStatsProps) {
	return (
		<div className={styles.delegationCardStats}>
			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
						<span className='font-semibold md:text-2xl'>
							{formatUSDWithUnits(formatBnBalance(delegate.maxDelegated, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
						</span>
					</div>
					<span className={styles.delegationCardStatsItemText}>{t('Delegation.maxDelegated')}</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate.last30DaysVotedProposalsCount}</div>
					<span className={styles.delegationCardStatsItemText}>{t('Delegation.votedProposals')}</span>
					<span className={styles.delegationCardStatsItemTextPast30Days}>({t('Delegation.past30Days')})</span>
				</div>
			</div>
			<div className='p-5 text-center'>
				<div>
					<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate.delegators?.length || 0}</div>
					<span className={styles.delegationCardStatsItemText}>{t('Delegation.delegators')}</span>
				</div>
			</div>
		</div>
	);
}

export default DelegateStats;
