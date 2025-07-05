// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@ui/Button';
import { Pencil } from 'lucide-react';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useTranslations } from 'next-intl';
import styles from './ListingTable.module.scss';

function NoUserPreimage() {
	const t = useTranslations();
	return (
		<div className={styles.noPreimage}>
			<p className={styles.no_data}>
				<Image
					src={NoActivity}
					alt='no data'
					width={200}
					height={200}
				/>
				{t('Preimages.noUserPreimages')}
			</p>
			<Link
				href='/create'
				className='w-full'
			>
				<Button className='w-full'>
					<Pencil className='h-3 w-3' />
					{t('Preimages.createOneNow')}
				</Button>
			</Link>
		</div>
	);
}

export default NoUserPreimage;
