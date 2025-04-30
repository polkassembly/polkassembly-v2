// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EPostOrigin, EProposalType, IStatusHistoryItem } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import VoteCurves from './VoteCurves';
import styles from './VoteCurvesData.module.scss'; // Import the SCSS module
import LoadingLayover from '../../LoadingLayover';

interface Props {
	proposalType: EProposalType;
	index: string;
	trackName: EPostOrigin;
	createdAt?: Date;
	timeline?: IStatusHistoryItem[];
	setThresholdValues?: (values: { approvalThreshold: number; supportThreshold: number }) => void;
	thresholdValues?: { approvalThreshold: number; supportThreshold: number };
}

function VoteCurvesData({ proposalType, index, trackName, createdAt, timeline, setThresholdValues, thresholdValues }: Props) {
	const t = useTranslations('PostDetails.VoteCurves');

	const fetchVoteCurves = async () => {
		const { data, error } = await NextApiClientService.getVoteCurves({
			proposalType,
			indexOrHash: index
		});

		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch API data');
		}

		return data;
	};

	const { data: voteCurveData, isFetching } = useQuery({
		queryKey: ['vote-curves', proposalType, index],
		queryFn: () => fetchVoteCurves(),
		placeholderData: [],
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	const latestApproval = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].approvalPercent : null;
	const latestSupport = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].supportPercent : null;

	return (
		<section className={styles.voteDataContainer}>
			<h2 className={styles.heading}>{t('votingData')}</h2>
			<div className='relative mt-4'>
				{isFetching && <LoadingLayover />}
				<VoteCurves
					voteCurveData={voteCurveData || []}
					trackName={trackName}
					timeline={timeline}
					createdAt={createdAt}
					setThresholdValues={setThresholdValues}
				/>
				<div className='mt-2 flex w-full flex-col gap-y-2 text-xs text-wallet_btn_text'>
					<div className='flex w-full items-center gap-x-4'>
						<p className='flex w-1/2 items-center justify-between'>
							<span className='flex items-center gap-x-2'>
								<span className='h-4 rotate-45 border-l-2 border-dashed border-success' />
								{t('approval')}
							</span>
							<span className='font-medium text-text_primary'>{latestApproval?.toFixed(2)}%</span>
						</p>
						<p className='flex w-1/2 items-center justify-between'>
							<span className='flex items-center gap-x-2'>
								<span className='h-4 rotate-45 border-l-2 border-dashed border-navbar_border' />
								{t('support')}
							</span>
							<span className='font-medium text-text_primary'>{latestSupport?.toFixed(2)}%</span>
						</p>
					</div>
					<div className='flex w-full items-center gap-x-4'>
						<p className='flex w-1/2 items-center justify-between'>
							<span className='flex items-center gap-x-2'>
								<span className='h-4 rotate-45 border-l-2 border-success' />
								{t('threshold')}
							</span>
							<span className='font-medium text-text_primary'>{thresholdValues?.approvalThreshold?.toFixed(2)}%</span>
						</p>
						<p className='flex w-1/2 items-center justify-between'>
							<span className='flex items-center gap-x-2'>
								<span className='h-4 rotate-45 border-l-2 border-navbar_border' />
								{t('threshold')}
							</span>
							<span className='font-medium text-text_primary'>{thresholdValues?.supportThreshold?.toFixed(2)}%</span>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

export default VoteCurvesData;
