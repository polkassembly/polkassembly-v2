// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import styles from './ActivityFeedActiveProposal.module.scss';

function ActivityFeedActiveProposal() {
	const t = useTranslations();
	const { data: activeProposalCount } = useQuery({
		queryKey: ['activeProposalCount'],
		queryFn: () => fetch('/api/v2/activityFeed/activeproposal').then((res) => res.json())
	});
	return (
		<div className={styles.activeProposalContainer}>
			<div className={styles.activeProposalTitle}>
				<span className={`${styles.activeProposalTitleText} dark:text-white`}>
					{t('ActivityFeed.VotedProposals')} <FaAngleRight />
				</span>
				<span className={styles.activeProposalTitleDate}>{t('ActivityFeed.Last15Days')}</span>
			</div>
			<div className='text-sm'>
				<span className='text-xs text-wallet_btn_text'>
					<span className='text-xl font-semibold text-navbar_border'>{activeProposalCount?.voteCount || 0}</span> out of{' '}
					<span className='text-sm font-semibold'>{activeProposalCount?.activeProposalCount || 0}</span> {t('ActivityFeed.ActiveProposals')}
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedActiveProposal;
