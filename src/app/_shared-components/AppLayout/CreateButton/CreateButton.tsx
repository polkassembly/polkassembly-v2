// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import PencilIcon from '@assets/sidebar/create-pencil-icon.svg';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import style from './CreateButton.module.scss';

function CreateButton({ state }: { state: 'collapsed' | 'expanded' }) {
	const t = useTranslations();

	const { user } = useUser();

	return (
		<div className={`${style.card} ${state === 'collapsed' ? 'w-full' : 'lg:w-[200px]'}`}>
			<Link
				href={user ? '/create' : '/login?nextUrl=create'}
				className={`${style.trigger} ${state === 'collapsed' ? style.triggerCollapsed : style.triggerExpanded}`}
			>
				<Image
					src={PencilIcon}
					alt='Create Pencil Icon'
					width={20}
					height={20}
				/>
				{state !== 'collapsed' && <span className={style.triggerText}>{t('CreateProposalDropdownButton.create')}</span>}
			</Link>
		</div>
	);
}

export default CreateButton;
