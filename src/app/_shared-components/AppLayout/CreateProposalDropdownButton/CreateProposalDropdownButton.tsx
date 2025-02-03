// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { useTheme } from 'next-themes';
import { ETheme } from '@/_shared/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import style from './CreateProposalDropdownButton.module.scss';
import { Icon, IconName } from '../../Icon';

function CreateProposalDropdownButton({ state }: { state: 'collapsed' | 'expanded' }) {
	const t = useTranslations();
	const menuItems = [
		{ title: t('CreateProposalDropdownButton.treasuryProposal'), icon: 'sidebar/treasury-proposal', url: '#' },
		{ title: t('CreateProposalDropdownButton.proposal'), icon: 'sidebar/proposal-icon', url: '#' },
		{ title: t('CreateProposalDropdownButton.discussionPost'), icon: 'sidebar/discussion-icon', url: '#' }
	];

	const { resolvedTheme: theme } = useTheme();

	return (
		<div className={`${style.card} ${state === 'collapsed' ? 'w-full' : 'lg:w-[200px]'}`}>
			<Popover>
				<PopoverTrigger asChild>
					<div className={`${style.trigger} ${state === 'collapsed' ? style.triggerCollapsed : style.triggerExpanded}`}>
						<Icon
							name='sidebar/create-pencil-icon'
							className='h-5 w-5'
						/>
						{state !== 'collapsed' && (
							<>
								<span className={style.triggerText}>{t('CreateProposalDropdownButton.create')}</span>
								<ChevronDown className={style.triggerIcon} />
							</>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent
					side={state === 'collapsed' ? 'right' : 'bottom'}
					sideOffset={10}
					className={style.popoverContent}
				>
					<ul className='space-y-2'>
						{menuItems.map((item) => (
							<li
								key={item.title}
								className={style.menuItem}
							>
								<Icon
									name={item.icon as IconName}
									className={`h-5 w-5 ${theme === ETheme.DARK && 'dark-icons'}`}
								/>

								<Link
									href={item.url}
									className={style.menuLink}
								>
									{item.title}
								</Link>
							</li>
						))}
					</ul>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default CreateProposalDropdownButton;
