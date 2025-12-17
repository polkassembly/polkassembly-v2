// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';
import { ITreasuryStats } from '@/_shared/types';
import ActivityFeedSidebar from '../ActivityFeedSidebar';
import styles from '../ActivityFeedComp/ActivityFeedComp.module.scss';

interface TabContentLayoutProps {
	children: ReactNode;
	treasuryStatsData: ITreasuryStats[];
}

function TabContentLayout({ children, treasuryStatsData }: TabContentLayoutProps) {
	return (
		<div className={styles.gridContainer}>
			<div className={styles.mainContent}>{children}</div>
			<div className={styles.sidebar}>
				<ActivityFeedSidebar treasuryStatsData={treasuryStatsData} />
			</div>
		</div>
	);
}

export default TabContentLayout;
