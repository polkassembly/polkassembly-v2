// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EProposalType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import VotingChart from './VotingChart';
import styles from './VoteData.module.scss'; // Import the SCSS module
import { Skeleton } from '../../Skeleton';

interface Props {
	proposalType: EProposalType;
	index: string;
}

function VoteData({ proposalType, index }: Props) {
	const fetchVoteCurves = async (proposalType: EProposalType, index: string) => {
		const { data, error } = await NextApiClientService.getVoteCurves({
			proposalType,
			indexOrHash: index
		});

		if (error) {
			throw new ClientError(error.message || 'Failed to fetch API data');
		}

		return data;
	};

	const { data: voteCurveData, isFetching } = useQuery({
		queryKey: ['vote-curves', proposalType, index],
		queryFn: () => fetchVoteCurves(proposalType, index),
		placeholderData: [],
		staleTime: FIVE_MIN_IN_MILLI
	});

	const latestApproval = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].approvalPercent : null;
	const latestSupport = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].supportPercent : null;

	if (isFetching) {
		return <Skeleton className='h-80 w-full' />;
	}

	return (
		<section className={styles.voteDataContainer}>
			<h2 className={styles.heading}>Voting Data</h2>
			{Array.isArray(voteCurveData) && voteCurveData.length > 0 && (
				<div className={styles.chartContainer}>
					<VotingChart voteCurveData={voteCurveData} />
					<div className={styles.footer}>
						<p className={styles.footerText}>Approval: {latestApproval?.toFixed(2)}%</p>
						<p className={styles.footerText}>Support: {latestSupport?.toFixed(2)}%</p>
					</div>
				</div>
			)}
		</section>
	);
}

export default VoteData;
