// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Loader } from 'lucide-react';
import { useState } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ESocial } from '@/_shared/types';
import styles from '../Overview.module.scss';

function NewsSection() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const network = getCurrentNetwork();

	const t = useTranslations('Overview');
	const profile = NETWORKS_DETAILS[network].socialLinks?.find((link) => link.id === ESocial.TWITTER)?.href?.split('/')[3];

	if (!profile) {
		return null;
	}

	return (
		<div className={styles.news_section_container}>
			<h2 className={styles.news_section_title}>{t('news')}</h2>

			<div className='mt-2 overflow-hidden rounded-[10px] lg:h-[390px]'>
				{isLoading && <Loader className='mt-32 text-7xl' />}
				<div className='block dark:hidden'>
					<TwitterTimelineEmbed
						key='default'
						onLoad={() => setIsLoading(false)}
						sourceType='profile'
						screenName={profile}
						options={{ height: 450 }}
						noHeader
						noFooter
						theme='dark'
						noBorders
					/>
				</div>
				<div className='hidden dark:block'>
					<TwitterTimelineEmbed
						key='default'
						onLoad={() => setIsLoading(false)}
						sourceType='profile'
						screenName={profile}
						options={{ height: 450 }}
						noHeader
						noFooter
						theme='dark'
						noBorders
					/>
				</div>
			</div>
		</div>
	);
}

export default NewsSection;
