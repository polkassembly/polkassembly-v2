// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Separator } from '../../Separator';
import styles from './VoteCurvesData.module.scss';

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

export default VoteCurvesDetails;
