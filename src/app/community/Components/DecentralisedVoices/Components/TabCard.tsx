// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { ECommunityRole } from '@/_shared/types';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../../Header/Header.module.scss';

interface TabCardProps {
	cohortNumber: number;
	delegates: number;
	guardians: number;
	tracks: number;
}

function TabCard({ cohortNumber, delegates, guardians, tracks }: TabCardProps) {
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();

	const onTabChange = (value: ECommunityRole) => {
		router.push(`${pathname}?tab=${value}`);
	};

	const communityTabs = [
		{ label: t('Community.members'), value: ECommunityRole.MEMBERS },
		{ label: t('Community.delegates'), value: ECommunityRole.DELEGATES },
		{ label: t('Community.curators'), value: ECommunityRole.CURATORS },
		{ label: t('Community.decentralizedVoices'), value: ECommunityRole.DVS }
	];

	const description =
		guardians > 0
			? t('DecentralizedVoices.PeopleDescription', {
					cohortNumber,
					delegates,
					guardians,
					tracks
				})
			: t('DecentralizedVoices.PeopleDescriptionNoGuardians', {
					cohortNumber,
					delegates,
					tracks
				});

	return (
		<div className={styles.header}>
			<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 pt-5 lg:px-16'>
				<div className={styles.header_title_container}>
					<p className={styles.header_title}>{t('DecentralizedVoices.People')}</p>
					<p className={styles.header_description}>{description}</p>
				</div>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					{communityTabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							className={styles.header_tab}
							value={tab.value}
							onClick={() => onTabChange(tab.value)}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</div>
	);
}

export default TabCard;
