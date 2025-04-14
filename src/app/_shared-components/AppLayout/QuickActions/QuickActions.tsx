// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import QuickActionsIcon from '@assets/icons/quickactions.svg';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import style from './QuickActions.module.scss';

function QuickActions({ state }: { state: 'collapsed' | 'expanded' }) {
	const t = useTranslations();
	const { user } = useUser();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={`${style.card} ${state === 'collapsed' ? 'w-full' : 'lg:w-[200px]'}`}>
			<Popover
				open={isOpen}
				onOpenChange={setIsOpen}
			>
				<PopoverTrigger asChild>
					<Link
						href={user ? '/create' : '/login?nextUrl=create'}
						className={`${style.trigger} ${state === 'collapsed' ? style.triggerCollapsed : style.triggerExpanded}`}
						onMouseEnter={() => setIsOpen(true)}
						onMouseLeave={() => setIsOpen(false)}
					>
						<Image
							src={QuickActionsIcon}
							alt='Quick Actions Icon'
							width={20}
							height={20}
						/>
						{state !== 'collapsed' && <span className={style.triggerText}>{t('CreateProposalDropdownButton.quickActions')}</span>}
					</Link>
				</PopoverTrigger>
				<PopoverContent
					side='right'
					align='start'
					sideOffset={10}
					className='w-72 rounded-lg border border-border_grey bg-bg_modal p-4 shadow-md'
					onMouseEnter={() => setIsOpen(true)}
					onMouseLeave={() => setIsOpen(false)}
				>
					<div className='text-btn_secondary_text'>
						<h3 className='mb-1 text-lg font-medium'>{t('CreateProposalDropdownButton.quickActions')}</h3>
						<p className='text-sm'>{t('CreateProposalDropdownButton.quickActionsDescription')}</p>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default QuickActions;
