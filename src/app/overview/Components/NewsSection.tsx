// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingSpinner } from '@ui/LoadingSpinner';
import React, { useState } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { useTranslations } from 'next-intl';
import styles from './Overview.module.scss';

interface INewsProps {
	twitter: string;
}

function NewsSection({ twitter }: INewsProps) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const t = useTranslations('Overview');

	const profile = twitter ? twitter.split('/')[3] : 'polkadot';

	return (
		<div className={styles.news_section_container}>
			<h2 className={styles.news_section_title}>{t('news')}</h2>

			{isLoading && (
				<div className='flex h-full items-center justify-center py-32'>
					<LoadingSpinner />
				</div>
			)}

			<div className='mt-6'>
				<div className='overflow-hidden rounded-[10px] lg:h-[380px]'>
					<div className='block dark:hidden'>
						<TwitterTimelineEmbed
							onLoad={() => setIsLoading(false)}
							sourceType='profile'
							screenName={profile}
							options={{ height: 450 }}
							noHeader
							noFooter
							noBorders
							theme='light'
						/>
					</div>
					<div className='hidden dark:block'>
						<TwitterTimelineEmbed
							onLoad={() => setIsLoading(false)}
							sourceType='profile'
							screenName={profile}
							options={{ height: 450 }}
							noHeader
							noFooter
							noBorders
							theme='dark'
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewsSection;
