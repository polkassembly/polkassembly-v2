// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import PencilIcon from '@assets/sidebar/create-pencil-icon.svg';
import TreasuryProposalIcon from '@assets/sidebar/treasury-proposal.svg';
import ProposalIcon from '@assets/sidebar/proposal-icon.svg';
import { useTheme } from 'next-themes';
import DiscussionIcon from '@assets/sidebar/discussion-icon.svg';
import Link from 'next/link';
import style from './CreateProposalDropdownButton.module.scss';

function CreateProposalDropdownButton({ state }: { state: 'collapsed' | 'expanded' }) {
	const menuItems = [
		{ title: 'Treasury Proposal', icon: TreasuryProposalIcon, url: '#' },
		{ title: 'Proposal', icon: ProposalIcon, url: '#' },
		{ title: 'Discussion Post', icon: DiscussionIcon, url: '#' }
	];

	const { resolvedTheme: theme } = useTheme();

	return (
		<div className={`${style.card} mt-4 p-[2px] ${state === 'collapsed' ? 'w-full' : 'mx-4 lg:w-[200px]'}`}>
			<Popover>
				<PopoverTrigger asChild>
					<div className={`${style.trigger} ${state === 'collapsed' ? style.triggerCollapsed : style.triggerExpanded}`}>
						<Image
							src={PencilIcon}
							alt='Create Pencil Icon'
							width={20}
							height={20}
						/>
						{state !== 'collapsed' && (
							<>
								<span className={style.triggerText}>Create</span>
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
								<Image
									src={item.icon}
									alt='Dropdown Icon'
									width={20}
									height={20}
									className={`${theme === 'dark' ? 'dark-icons' : ''}`}
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
