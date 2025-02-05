// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@ui/Skeleton';
import { useUser } from '@/hooks/useUser';
import styles from './ActivityFeedActiveProposal.module.scss';

function ActivityFeedActiveProposal() {
	const t = useTranslations();
	const { user } = useUser();

	const { data, isLoading } = useQuery({
		queryKey: ['votedActiveProposalsCount', user?.id],
		queryFn: () => fetch(`/api/v2/users/id/${user?.id}/voted-active-proposals-count`).then((res) => res.json()),
		enabled: !!user?.id
	});

	if (!user) return null;
	if (isLoading) {
		return <Skeleton className='h-4 w-[20px]' />;
	}

	const votedProposalsCount = data?.votedProposalsCount;
	const activeProposalsCount = data?.activeProposalsCount;

	if (data) {
		return (
			<div className={styles.activeProposalContainer}>
				<div className={styles.activeProposalTitle}>
					<span className={`${styles.activeProposalTitleText} dark:text-white`}>{t('ActivityFeed.VotedProposals')}</span>
				</div>
				<div className='text-sm'>
					<span className='text-xs text-wallet_btn_text'>
						<span className='text-xl font-semibold text-navbar_border'>{votedProposalsCount}</span> out of <span className='text-sm font-semibold'>{activeProposalsCount}</span>{' '}
						{t('ActivityFeed.ActiveProposals')}
					</span>
				</div>
			</div>
		);
	}
}

export default ActivityFeedActiveProposal;
