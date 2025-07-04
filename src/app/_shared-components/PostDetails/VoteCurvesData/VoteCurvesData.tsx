// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, IStatusHistoryItem, IVoteCurve } from '@/_shared/types';
import VoteCurves from './VoteCurves';
import styles from './VoteCurvesData.module.scss'; // Import the SCSS module
import LoadingLayover from '../../LoadingLayover';
import VoteCurvesDetails from './VoteCurvesDetails';

interface Props {
	trackName: EPostOrigin;
	createdAt?: Date;
	timeline?: IStatusHistoryItem[];
	setThresholdValues?: (values: { approvalThreshold: number; supportThreshold: number }) => void;
	thresholdValues?: { approvalThreshold: number; supportThreshold: number };
	latestApproval: number | null;
	latestSupport: number | null;
	isFetching: boolean;
	voteCurveData: IVoteCurve[];
}

// main component
function VoteCurvesData({ trackName, createdAt, timeline, setThresholdValues, thresholdValues, latestApproval, latestSupport, isFetching, voteCurveData }: Props) {
	return (
		<section className={styles.voteDataContainer}>
			<div className='relative mt-4'>
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
			</div>
		</section>
	);
}

export default VoteCurvesData;
