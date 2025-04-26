// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import style from './ParentBountyCard.module.scss';

function ParentBountyCard({ parentBountyIndex }: { parentBountyIndex: number }) {
	const t = useTranslations('ChildBounties');
	return (
		<div className={style.parentBountyCardWrapper}>
			<div className={style.parentBountyCardItem}>
				<p>{t('parentBounty')}</p>
				<Link
					className='text-sm text-text_pink'
					href={`/bounty/${parentBountyIndex}`}
				>
					#{parentBountyIndex}
				</Link>
			</div>
		</div>
	);
}

export default ParentBountyCard;
