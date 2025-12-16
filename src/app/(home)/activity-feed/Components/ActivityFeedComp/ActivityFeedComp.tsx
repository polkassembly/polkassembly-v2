// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab, IGenericListingResponse, IPostListing, ITreasuryStats } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Link from 'next/link';
import TabContentLayout from '../TabContentLayout/TabContentLayout';
import styles from './ActivityFeedComp.module.scss';
import ActivityFeedPostList from '../ActivityFeedPostList/ActivityFeedPostList';
import SubscribedPostList from '../ActivityFeedPostList/SubscribedPostList';

function ActivityFeedComp({
	initialData,
	activeTab,
	treasuryStatsData
}: {
	initialData: IGenericListingResponse<IPostListing>;
	activeTab: EActivityFeedTab;
	treasuryStatsData: ITreasuryStats[];
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const socialLinks = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS]?.socialLinks ?? [];

	return (
		<Tabs
			value={activeTab}
			defaultValue={activeTab}
			className={styles.tabsContainer}
		>
			<div className={styles.headerContainer}>
				<div className={styles.headerInner}>
					<div className={styles.headerTop}>
						<div className={styles.activityFeedToggleButton}>
							<h1 className={styles.activityFeedTitle}>{t('ActivityFeed.title')}</h1>
						</div>
						<div className={styles.socialLinks}>
							{socialLinks?.map((link) => (
								<Link
									key={link.id}
									href={link.href}
									target='_blank'
									rel='noopener noreferrer'
									className={styles.socialLink}
									title={link.label}
									aria-label={link.label}
								>
									<link.icon />
								</Link>
							))}
						</div>
					</div>
					<p className={styles.description}>{t('ActivityFeed.description')}</p>
					<TabsList className={styles.tabsList}>
						<TabsTrigger
							className={styles.tabsTrigger}
							value={EActivityFeedTab.SUBSCRIBED}
							asChild
						>
							<Link
								className='uppercase'
								href={`/activity-feed?tab=${EActivityFeedTab.SUBSCRIBED}`}
							>
								{t('ActivityFeed.Following')}
							</Link>
						</TabsTrigger>
						<TabsTrigger
							className={styles.tabsTrigger}
							value={EActivityFeedTab.EXPLORE}
							asChild
						>
							<Link
								href={`/activity-feed?tab=${EActivityFeedTab.EXPLORE}`}
								className='uppercase'
							>
								{t('ActivityFeed.ExploreTab')}
							</Link>
						</TabsTrigger>
					</TabsList>
				</div>
			</div>

			<div className={styles.contentContainer}>
				<TabsContent value={EActivityFeedTab.SUBSCRIBED}>
					<TabContentLayout treasuryStatsData={treasuryStatsData}>
						<SubscribedPostList initialData={initialData} />
					</TabContentLayout>
				</TabsContent>
				<TabsContent value={EActivityFeedTab.EXPLORE}>
					<TabContentLayout treasuryStatsData={treasuryStatsData}>
						<ActivityFeedPostList initialData={initialData} />
					</TabContentLayout>
				</TabsContent>
			</div>
		</Tabs>
	);
}

export default ActivityFeedComp;
