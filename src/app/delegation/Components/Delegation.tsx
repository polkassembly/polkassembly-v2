// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { useUser } from '@/hooks/useUser';
import { IDelegationStats } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import styles from './Delegation.module.scss';
import DelegationPopupCard from './DelegationPopupCard/DelegationPopupCard';
import DelegationStats from './DelegationStats/DelegationStats';
import MyDelegation from './MyDelegation/MyDelegation';
import UserWalletData from './UserWalletData/UserWalletData';
import TrendingDelegates from './TrendingDelegates/TrendingDelegates';

enum EDelegationTab {
	DASHBOARD = 'Dashboard',
	MY_DELEGATION = 'My Delegation'
}

function Delegation({ delegationStats }: { delegationStats: IDelegationStats }) {
	const { user } = useUser();
	const t = useTranslations('Delegation');

	if (!user) {
		return (
			<div>
				<UserWalletData />
				<div className='mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 lg:px-16'>
					<DelegationPopupCard />
					<DelegationStats delegationStats={delegationStats} />
					<TrendingDelegates />
				</div>
			</div>
		);
	}

	return (
		<div>
			<UserWalletData />
			<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
				<div className={styles.delegation}>
					<Tabs defaultValue={EDelegationTab.DASHBOARD}>
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
						<TabsContent value={EDelegationTab.DASHBOARD}>
							<DelegationPopupCard />
							<DelegationStats delegationStats={delegationStats} />
							<TrendingDelegates />
						</TabsContent>
						<TabsContent value={EDelegationTab.MY_DELEGATION}>
							<MyDelegation />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

export default Delegation;
