// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EPostOrigin, EProposalType, IStatusHistoryItem } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Expand } from 'lucide-react';
import Image from 'next/image';
import voteCurves from '@assets/delegation/votingPower.svg';
import VoteCurves from './VoteCurves';
import styles from './VoteCurvesData.module.scss'; // Import the SCSS module
import LoadingLayover from '../../LoadingLayover';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import { Separator } from '../../Separator';

interface Props {
	proposalType: EProposalType;
	index: string;
	trackName: EPostOrigin;
	createdAt?: Date;
	timeline?: IStatusHistoryItem[];
	setThresholdValues?: (values: { approvalThreshold: number; supportThreshold: number }) => void;
	thresholdValues?: { approvalThreshold: number; supportThreshold: number };
}

function VoteCurvesDetails({
	latestApproval,
	latestSupport,
	thresholdValues
}: {
	latestApproval: number | null;
	latestSupport: number | null;
	thresholdValues: { approvalThreshold: number; supportThreshold: number } | null;
}) {
	const t = useTranslations('PostDetails.VoteCurves');

	return (
		<div className={styles.voteCurvesDetailsWrapper}>
			<div className={styles.voteCurvesDetailsWrapperItem}>
				<p className={styles.voteCurvesDetailsWrapperItemTitle}>
					<span className={styles.voteCurvesDetailsWrapperItemTitleText}>
						<span className={styles.voteCurvesDetailsWrapperItemTitleTextIcon} />
						{t('approval')}
					</span>
					<span className={styles.voteCurvesDetailsWrapperItemTitleTextValue}>{latestApproval?.toFixed(2)}%</span>
				</p>
				<p className={styles.voteCurvesDetailsWrapperItemTitle}>
					<span className={styles.voteCurvesDetailsWrapperItemTitleText}>
						<span className={styles.voteCurvesDetailsWrapperItemTitleTextIcon} />
						{t('support')}
					</span>
					<span className={styles.voteCurvesDetailsWrapperItemTitleTextValue}>{latestSupport?.toFixed(2)}%</span>
				</p>
			</div>
			<Separator
				orientation='horizontal'
				className='my-1 h-[1px]'
			/>
			<div className={styles.voteCurvesDetailsWrapperItem}>
				<p className={styles.voteCurvesDetailsWrapperItemTitle}>
					<span className={styles.voteCurvesDetailsWrapperItemTitleText}>
						<span className='h-4 rotate-45 border-l-2 border-success' />
						{t('threshold')}
					</span>
					<span className={styles.voteCurvesDetailsWrapperItemTitleTextValue}>{thresholdValues?.approvalThreshold?.toFixed(2)}%</span>
				</p>
				<p className={styles.voteCurvesDetailsWrapperItemTitle}>
					<span className={styles.voteCurvesDetailsWrapperItemTitleText}>
						<span className={styles.voteCurvesDetailsWrapperItemTitleTextIcon} />
						{t('threshold')}
					</span>
					<span className={styles.voteCurvesDetailsWrapperItemTitleTextValue}>{thresholdValues?.supportThreshold?.toFixed(2)}%</span>
				</p>
			</div>
		</div>
	);
}

// main component
function VoteCurvesData({ proposalType, index, trackName, createdAt, timeline, setThresholdValues, thresholdValues }: Props) {
	const t = useTranslations('PostDetails.VoteCurves');
	const [isExpanded, setIsExpanded] = useState(false);

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
			<div className='relative mt-4'>
				<div className='flex justify-end'>
					<Button
						variant='ghost'
						className='flex items-center gap-x-2'
						onClick={() => setIsExpanded(true)}
					>
						<Expand className='h-2.5 w-3' />
					</Button>
				</div>
				{isFetching && <LoadingLayover />}
				<VoteCurves
					voteCurveData={voteCurveData || []}
					trackName={trackName}
					timeline={timeline}
					createdAt={createdAt}
					setThresholdValues={setThresholdValues}
				/>
				<VoteCurvesDetails
					latestApproval={latestApproval}
					latestSupport={latestSupport}
					thresholdValues={thresholdValues || null}
				/>
				<Dialog
					open={isExpanded}
					onOpenChange={setIsExpanded}
				>
					<DialogContent className={styles.dialogContent}>
						<DialogHeader className={styles.dialogHeader}>
							<DialogTitle className={styles.dialogTitle}>
								<Image
									src={voteCurves}
									alt='vote-curves'
									width={24}
									height={24}
								/>
								<span className={styles.dialogTitle}>{t('votingData')}</span>
							</DialogTitle>
						</DialogHeader>
						<div className='p-8'>
							{isFetching && <LoadingLayover />}
							<VoteCurves
								voteCurveData={voteCurveData || []}
								trackName={trackName}
								timeline={timeline}
								createdAt={createdAt}
								setThresholdValues={setThresholdValues}
							/>
							<div className='mt-6'>
								<VoteCurvesDetails
									latestApproval={latestApproval}
									latestSupport={latestSupport}
									thresholdValues={thresholdValues || null}
								/>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</section>
	);
}

export default VoteCurvesData;
