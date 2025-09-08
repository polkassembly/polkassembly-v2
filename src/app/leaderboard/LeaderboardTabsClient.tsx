// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import Leaderboard from './Components/index';
import styles from './LeaderboardTabsClient.module.scss';

interface Props {
	data: IGenericListingResponse<IPublicUser>;
	top3RankData: IGenericListingResponse<IPublicUser>;
}

enum ETabState {
	LEADERBOARD = 'leaderboard',
	ASTRALS = 'astrals'
}

export default function LeaderboardTabsClient({ data, top3RankData }: Props) {
	const [activeTab, setActiveTab] = useState<ETabState>(ETabState.LEADERBOARD);

	return (
		<div className={styles.tabs}>
			<div className='flex gap-x-2 lg:px-20'>
				<button
					type='button'
					className={`${styles['tab-button']} uppercase ${activeTab === ETabState.LEADERBOARD ? styles['tab-button-active'] : ''}`}
					onClick={() => setActiveTab(ETabState.LEADERBOARD)}
				>
					LEADERBOARD
					<span
						className={`absolute bottom-0 left-0 h-[2px] w-full ${activeTab === ETabState.LEADERBOARD ? 'bg-pink-600' : 'bg-transparent'} transition-all data-[state=inactive]:w-0`}
					/>
				</button>
				<button
					type='button'
					className={`${styles['tab-button']} uppercase ${activeTab === ETabState.ASTRALS ? styles['tab-button-active'] : ''}`}
					onClick={() => setActiveTab(ETabState.ASTRALS)}
				>
					ASTRALS SCORING
					<span
						className={`absolute bottom-0 left-0 h-[2px] w-full ${activeTab === ETabState.ASTRALS ? 'bg-pink-600' : 'bg-transparent'} transition-all data-[state=inactive]:w-0`}
					/>{' '}
				</button>
			</div>

			<div>
				{activeTab === ETabState.LEADERBOARD ? (
					<div className='m-0 w-full bg-page_background px-5 py-10'>
						<Leaderboard
							data={data}
							top3RankData={top3RankData}
						/>
					</div>
				) : (
					<div>
						<div className='p-6'>
							<p className='text-sm text-muted-foreground'>Astrals Scoring content goes here...</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
