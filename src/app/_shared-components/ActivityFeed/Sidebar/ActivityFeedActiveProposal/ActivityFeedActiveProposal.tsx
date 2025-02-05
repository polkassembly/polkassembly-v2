// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import styles from './ActivityFeedActiveProposal.module.scss';

function ActivityFeedActiveProposal() {
	const t = useTranslations();
	const { user } = useUser();
	const { data } = useQuery({
		queryKey: ['votedActiveProposalsCount', user?.id],
		queryFn: () => fetch(`/api/v2/users/id/${user?.id}/voted-active-proposals-count`).then((res) => res.json())
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
					<span className='text-xl font-semibold text-navbar_border'>{data?.votedProposalsCount || 0}</span> out of{' '}
					<span className='text-sm font-semibold'>{data?.activeProposalsCount || 0}</span> {t('ActivityFeed.ActiveProposals')}
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedActiveProposal;
