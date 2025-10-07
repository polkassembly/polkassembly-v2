// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import KlaraAvatar from '@assets/klara/avatar.svg';
import { CgArrowsVAlt } from '@react-icons/all-files/cg/CgArrowsVAlt';
import { IoClose } from '@react-icons/all-files/io5/IoClose';
import { IoChevronDown } from '@react-icons/all-files/io5/IoChevronDown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { EChatState } from '@/_shared/types';
import styles from '../ChatUI.module.scss';

interface Props {
	setChatState: (state: EChatState) => void;
}

function ChatHeader({ setChatState }: Props) {
	return (
		<div className={styles.chatUIHeader}>
			<Image
				src={KlaraAvatar}
				alt=''
				width={24}
				height={24}
				className='h-6 w-6'
			/>
			<p className='text-xl font-semibold text-text_primary'>Klara</p>
			<div className={styles.chatUIControls}>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type='button'
							aria-label='expand'
							onClick={() => setChatState(EChatState.EXPANDED)}
							className={`${styles.controlIcon} border-none bg-green-400 outline-none focus:outline-none`}
						>
							<CgArrowsVAlt className='size-4 rotate-45 text-white' />
						</button>
					</TooltipTrigger>
					<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
						<p>expand</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type='button'
							onClick={() => setChatState(EChatState.COLLAPSED)}
							aria-label='collapse'
							className={`${styles.controlIcon} border-none bg-yellow-400 outline-none focus:outline-none`}
						>
							<IoChevronDown className='size-4 text-white' />
						</button>
					</TooltipTrigger>
					<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
						<p>collapse</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type='button'
							aria-label='close'
							onClick={() => setChatState(EChatState.CLOSED)}
							className={`${styles.controlIcon} border-none bg-red-400 outline-none focus:outline-none`}
						>
							<IoClose className='size-4 text-white' />
						</button>
					</TooltipTrigger>
					<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
						<p>close</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}

export default ChatHeader;
