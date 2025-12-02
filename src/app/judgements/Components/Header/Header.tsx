// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import Link from 'next/link';
import { EJudgementDashboardTabs, ESetIdentityStep } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { useIsRegistrar } from '@/hooks/useIsRegistrar';
import { useUser } from '@/hooks/useUser';
import BecomeRegistrarModal from '../BecomeRegistrarModal/BecomeRegistrarModal';
import styles from './Header.module.scss';

function Header() {
	const t = useTranslations();
	const { data: isRegistrar } = useIsRegistrar();
	const { user } = useUser();

	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_title_container}>
					<p className={styles.header_title}>{t('Judgements.identityAndJudgement')}</p>
					<div className={styles.header_button_container}>
						<Link href={`/set-identity?open=${ESetIdentityStep.REQUEST_JUDGEMENT}`}>
							<Button>{t('Judgements.requestJudgement')}</Button>
						</Link>
						<BecomeRegistrarModal />
					</div>
				</div>
				<p>{t('Judgements.registrarDescription')}</p>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					{isRegistrar && (
						<TabsTrigger
							className={styles.header_tab}
							value={EJudgementDashboardTabs.REQUESTS}
						>
							Requests
						</TabsTrigger>
					)}
					<TabsTrigger
						className={styles.header_tab}
						value={EJudgementDashboardTabs.OVERVIEW}
					>
						Overview
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={EJudgementDashboardTabs.JUDGEMENTS}
					>
						{t('Judgements.judgements')}
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={EJudgementDashboardTabs.REGISTRARS}
					>
						{t('Judgements.registrars')}
					</TabsTrigger>
					{user?.defaultAddress && (
						<TabsTrigger
							className={styles.header_tab}
							value={EJudgementDashboardTabs.MY_DASHBOARD}
						>
							{t('Judgements.myDashboard')}
						</TabsTrigger>
					)}
				</TabsList>
			</div>
		</div>
	);
}

export default Header;
