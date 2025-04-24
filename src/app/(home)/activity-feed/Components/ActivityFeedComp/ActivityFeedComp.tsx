// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab, IGenericListingResponse, IPostListing, ESidebarState } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent } from '@ui/Tabs';
import { useSidebar } from '@ui/Sidebar/Sidebar';
import { Button } from '@/app/_shared-components/Button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import ActivityFeedToggleButton from '../ActivityFeedToggleButton/ActivityFeedToggleButton';
import ActivityFeedSidebar from '../ActivityFeedSidebar';
import styles from './ActivityFeedComp.module.scss';
import ActivityFeedPostList from '../ActivityFeedPostList/ActivityFeedPostList';
import SubscribedPostList from '../ActivityFeedPostList/SubscribedPostList';

function ActivityFeedComp({ initialData, activeTab }: { initialData: IGenericListingResponse<IPostListing>; activeTab: EActivityFeedTab }) {
	const t = useTranslations();
	const { state } = useSidebar();
	const router = useRouter();

	return (
		<div className={cn('min-h-screen bg-page_background pt-5', state === ESidebarState.EXPANDED ? 'px-5 lg:px-16' : 'px-5 lg:px-10')}>
			<div className='container mx-auto grid grid-cols-12 gap-4'>
				<div className='col-span-12'>
					<div className={styles.activityFeedContainer}>
						<div className={styles.activityFeedToggleButton}>
							<div>
								<h1 className={styles.activityFeedTitle}>{t('ActivityFeed.title')}</h1>
							</div>
							<ActivityFeedToggleButton activeTab={activeTab} />
						</div>
						<Button
							variant='secondary'
							onClick={() => router.push('/')}
							rightIcon={<RefreshCw className='h-4 w-4' />}
						>
							{t('ActivityFeed.switchToOverview')}
						</Button>
					</div>
				</div>

				<div className={styles.activityFeedTabs}>
					<Tabs
						className={styles.activityFeedTabsContent}
						value={activeTab}
						defaultValue={activeTab}
					>
						{activeTab === EActivityFeedTab.EXPLORE && (
							<TabsContent value={EActivityFeedTab.EXPLORE}>
								<ActivityFeedPostList initialData={initialData} />
							</TabsContent>
						)}
						{activeTab === EActivityFeedTab.SUBSCRIBED && (
							<TabsContent value={EActivityFeedTab.SUBSCRIBED}>
								<SubscribedPostList initialData={initialData} />
							</TabsContent>
						)}
					</Tabs>
				</div>

				<div className='hidden xl:col-span-3 xl:block'>
					<ActivityFeedSidebar />
				</div>
			</div>
		</div>
	);
}

export default ActivityFeedComp;
