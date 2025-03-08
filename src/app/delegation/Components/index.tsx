// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { useUser } from '@/hooks/useUser';
import { IDelegate, IDelegationStats } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import styles from './Delegation.module.scss';
import DelegationSupplyData from './DelegationSupplyData';
import DelegationCard from './DelegationCard';
import DelegationPopupCard from './DelegationPopupCard';
import MyDelegation from './MyDelegation';

enum EDelegationTab {
	DASHBOARD = 'Dashboard',
	MY_DELEGATION = 'My Delegation'
}

function Delegation({ delegationStats, delegates }: { delegationStats: IDelegationStats; delegates: IDelegate[] }) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const dashboardContent = (
		<div>
			<h1 className={styles.delegation_title}>{t('delegation')}</h1>
			<DelegationPopupCard />
			<DelegationSupplyData delegationStats={delegationStats} />
			<DelegationCard delegates={delegates} />
		</div>
	);

	if (!user) {
		return <div className='w-full'>{dashboardContent}</div>;
	}

	return (
		<div className={styles.delegation}>
			<Tabs defaultValue={EDelegationTab.MY_DELEGATION}>
				<TabsList className='mb-4 flex w-full justify-start border-border_grey dark:border-b'>
					<TabsTrigger
						className='m-0 p-2 px-4 text-input_text data-[state=active]:rounded-t-lg data-[state=active]:dark:bg-bg_modal'
						value={EDelegationTab.DASHBOARD}
					>
						{t('dashboard')}
					</TabsTrigger>
					<TabsTrigger
						className='m-0 p-2 px-4 text-input_text data-[state=active]:rounded-t-lg data-[state=active]:dark:bg-bg_modal'
						value={EDelegationTab.MY_DELEGATION}
					>
						{t('myDelegation')}
					</TabsTrigger>
				</TabsList>
				<TabsContent value={EDelegationTab.DASHBOARD}>{dashboardContent}</TabsContent>
				<TabsContent value={EDelegationTab.MY_DELEGATION}>
					<MyDelegation />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default Delegation;
