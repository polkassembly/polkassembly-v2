// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import VoteCurves from './VoteCurves';
import styles from './VoteCurvesData.module.scss'; // Import the SCSS module
import LoadingLayover from '../../LoadingLayover';
import VoteCurvesDetails from './VoteCurvesDetails';

interface Props {
	chartLabels: number[];
	approvalData: { x: number; y: number }[];
	supportData: { x: number; y: number }[];
	approvalThresholdData: { x: number; y: number }[];
	supportThresholdData: { x: number; y: number }[];
	thresholdValues?: { approvalThreshold: number; supportThreshold: number };
	latestApproval?: number;
	latestSupport?: number;
	isFetching: boolean;
}

// main component
function VoteCurvesData({
	chartLabels,
	approvalData,
	supportData,
	approvalThresholdData,
	supportThresholdData,
	thresholdValues,
	latestApproval,
	latestSupport,
	isFetching
}: Props) {
	return (
		<section className={styles.voteDataContainer}>
			<div className='relative mt-4'>
				{isFetching && <LoadingLayover />}
				<VoteCurves
					chartLabels={chartLabels}
					approvalData={approvalData}
					supportData={supportData}
					approvalThresholdData={approvalThresholdData}
					supportThresholdData={supportThresholdData}
				/>
				<VoteCurvesDetails
					latestApproval={latestApproval}
					latestSupport={latestSupport}
					thresholdValues={thresholdValues || null}
				/>
			</div>
		</section>
	);
}

export default VoteCurvesData;
