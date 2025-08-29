// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@ui/Skeleton';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import classes from './VotedActiveProposalCard.module.scss';

function VotedActiveProposalCard({ last15days, addresses }: { last15days?: boolean; addresses: string[] }) {
	const t = useTranslations('Profile');

	const getVotes = async () => {
		const { data, error } = await NextApiClientService.getActiveVotedProposalsCount({ addresses: addresses || [], last15days });
		if (error) {
			throw new Error(error.message);
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['votedActiveProposalsCount', addresses, last15days],
		queryFn: getVotes,
		enabled: !!addresses?.length,
		staleTime: FIVE_MIN_IN_MILLI
	});

	if (!addresses?.length) {
		return null;
	}

	return (
		<div className={classes.activeProposalContainer}>
			<div className={classes.activeProposalTitle}>
				<div className={classes.activeProposalTitleText}>
					<span>{t('Votes.votedProposals')}</span>
					{last15days && <span className={classes.activeProposalTitleDate}>{t('Votes.last15Days')}</span>}
				</div>
			</div>
			{isFetching ? (
				<Skeleton className='h-5 w-full' />
			) : (
				<div className='text-xs'>
					<span className='text-xs text-wallet_btn_text'>
						<span className='text-2xl font-semibold text-text_pink'>{data?.votedProposalsCount}</span> out of{' '}
						<span className='text-base font-semibold'>{data?.activeProposalsCount}</span> {t('Votes.activeProposals')}
					</span>
				</div>
			)}
		</div>
	);
}

export default VotedActiveProposalCard;
