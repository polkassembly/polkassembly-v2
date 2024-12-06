// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/Popover';
import PencilIcon from '@assets/sidebar/create-pencil-icon.svg';
import TreasuryProposalIcon from '@assets/sidebar/treasury-proposal.svg';
import ProposalIcon from '@assets/sidebar/proposal-icon.svg';
import DiscussionIcon from '@assets/sidebar/discussion-icon.svg';

import style from './CreateProposalDropdownButton.module.scss';

function CreateProposalDropdownButton({ state }: { state: 'collapsed' | 'expanded' }) {
	const menuItems = [
		{ title: 'Treasury Proposal', icon: TreasuryProposalIcon, url: '/treasury-proposal' },
		{ title: 'Proposal', icon: ProposalIcon, url: '/proposal' },
		{ title: 'Discussion Post', icon: DiscussionIcon, url: '/discussion-post' }
	];

	return (
		<div className={`${style.card} mt-4 p-[2px] ${state === 'collapsed' ? 'w-full' : 'mx-4 w-[200px]'}`}>
			<Popover>
				<PopoverTrigger asChild>
					<div
						className={`flex items-center justify-center gap-[6px] rounded-[10.5px] bg-white ${
							state !== 'collapsed' ? 'py-[2px]' : 'p-[5px]'
						} dark:bg-section-dark-background cursor-pointer`}
					>
						<Image
							src={PencilIcon}
							alt='Create Pencil Icon'
							width={20}
							height={20}
						/>
						{state !== 'collapsed' && (
							<>
								<span className='py-[6px] font-medium leading-4 text-create_proposal_btn_create dark:text-create_proposal_btn_create'>Create</span>
								<ChevronDown className='ml-1 text-sm text-create_proposal_btn_create dark:text-create_proposal_btn_create' />
							</>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent
					side={state === 'collapsed' ? 'right' : 'bottom'}
					sideOffset={10}
					className='w-56 rounded-xl border-[1px] border-solid border-white border-opacity-[10%] bg-white p-1.5 shadow-md'
				>
					<ul className='space-y-2'>
						{menuItems.map((item) => (
							<li
								key={item.title}
								className='flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800'
							>
								<Image
									src={item.icon}
									alt='Dropdown Icon'
									width={20}
									height={20}
								/>

								<a
									href={item.url}
									className='text-sidebar_text text-sm font-medium dark:text-gray-200'
								>
									{item.title}
								</a>
							</li>
						))}
					</ul>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default CreateProposalDropdownButton;
