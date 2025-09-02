// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@ui/Skeleton';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { EProposalType } from '@/_shared/types';
import classes from './VotedActiveProposalCard.module.scss';

function VotedActiveProposalCard({ addresses }: { addresses: string[] }) {
	const t = useTranslations('Profile');

	const getVotesAndActiveProposals = async () => {
		const [{ data: votesData }, { data: activeProposalsData }] = await Promise.all([
			NextApiClientService.getVotesByAddresses({ addresses: addresses || [], page: 1, limit: 100, proposalStatuses: ACTIVE_PROPOSAL_STATUSES }),
			NextApiClientService.fetchListingData({ proposalType: EProposalType.REFERENDUM_V2, page: 1, statuses: ACTIVE_PROPOSAL_STATUSES, limit: 100 })
		]);

		return { votesData, activeProposalsData };
	};

	const { data, isFetching } = useQuery({
		queryKey: ['votedActiveProposals', addresses.join(',')],
		queryFn: getVotesAndActiveProposals,
		enabled: !!addresses?.length,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div className={classes.activeProposalContainer}>
			<div className={classes.activeProposalTitle}>
				<div className={classes.activeProposalTitleText}>
					<span>{t('Votes.votedProposals')}</span>
				</div>
			</div>
			{isFetching ? (
				<Skeleton className='h-5 w-full' />
			) : (
				<div className='text-xs'>
					<span className='text-xs text-wallet_btn_text'>
						<span className='text-2xl font-semibold text-text_pink'>{data?.votesData?.totalCount || 0}</span> out of{' '}
						<span className='text-base font-semibold'>{data?.activeProposalsData?.totalCount || 0}</span> {t('Votes.activeProposals')}
					</span>
				</div>
			)}
		</div>
	);
}

export default VotedActiveProposalCard;
