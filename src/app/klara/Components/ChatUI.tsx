// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import MagicWandIcon from '@assets/sidebar/magic-wand.svg';
import UploadCircleIcon from '@assets/icons/upload-circle.svg';
import { CgArrowsVAlt } from '@react-icons/all-files/cg/CgArrowsVAlt';
import { IoClose } from '@react-icons/all-files/io5/IoClose';
import { IoChevronDown } from '@react-icons/all-files/io5/IoChevronDown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import styles from './ChatUI.module.scss';

type ChatState = 'expanded' | 'collapsed' | 'closed';

function ChatUI() {
	const [chatState, setChatState] = useState<ChatState>('expanded');

	const handleExpand = () => {
		setChatState('expanded');
	};

	const handleCollapse = () => {
		setChatState('collapsed');
	};

	const handleClose = () => {
		setChatState('closed');
	};

	// Don't render if closed
	if (chatState === 'closed') {
		return null;
	}

	return (
		<div className={styles.chatUI}>
			<div className={styles.container}>
				<div className={styles.chatUIHeader}>
					<Image
						src={MagicWandIcon}
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
									onClick={handleExpand}
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
									onClick={handleCollapse}
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
									onClick={handleClose}
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
				{chatState === 'expanded' && (
					<>
						<div className={styles.chatUIBody}>Chat body</div>
						<div className={styles.chatUIInput}>
							<input
								// ref={inputRef}
								type='text'
								// value={inputText}
								// onChange={handleInputChange}
								placeholder='Ask Klara anything'
								className='w-full !p-0 focus:border-transparent focus:outline-none focus:ring-0'
							/>
							<button
								type='submit'
								// disabled={!inputText.trim() || isLoading}
								className='flex items-center justify-center border-none !p-0 outline-none focus:border-none focus:outline-none focus:ring-0'
								aria-label='send'
							>
								{/* {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white' /> : 'Send'} */}
								<Image
									src={UploadCircleIcon}
									alt='send'
									width={32}
									height={32}
									className='h-8 w-8'
								/>
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default ChatUI;
