// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EPostOrigin } from '@/_shared/types';
import React from 'react';
import TrackStats from './TrackStats/TrackStats';
import TrackDelegations from './TrackDelegations/TrackDelegations';

function TrackAnalytics({ origin }: { origin?: EPostOrigin }) {
	return (
		<div className='flex flex-col gap-y-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
			<TrackStats origin={origin} />
			<TrackDelegations origin={origin} />
		</div>
	);
}

export default TrackAnalytics;
