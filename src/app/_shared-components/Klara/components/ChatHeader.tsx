// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import KlaraAvatar from '@assets/klara/avatar.svg';
import { CgArrowsVAlt } from '@react-icons/all-files/cg/CgArrowsVAlt';
import { CgArrowsScrollV } from '@react-icons/all-files/cg/CgArrowsScrollV';
import { IoClose } from '@react-icons/all-files/io5/IoClose';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { IoChevronDown } from '@react-icons/all-files/io5/IoChevronDown';
import { IoChevronUp } from '@react-icons/all-files/io5/IoChevronUp';
import HistoryIcon from '@assets/klara/history.svg';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { EChatState } from '@/_shared/types';
import { NotebookText } from 'lucide-react';
import styles from '../ChatUI.module.scss';

interface Props {
	chatState: EChatState | null;
	setChatState: (state: EChatState) => void;
	openMobileHistory?: () => void;
}

function ChatHeader({ chatState, setChatState, openMobileHistory }: Props) {
	const { data: stats } = useQuery({
		queryKey: ['klara-stats'],
		queryFn: async () => {
			const res = await NextApiClientService.getKlaraStats();
			if (!res.data) {
				throw new Error('Network response was not ok');
			}
			return res.data;
		}
	});

	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

	return (
		<div className={styles.chatUIHeader}>
			<div className='flex items-center gap-2'>
				<Image
					src={KlaraAvatar}
					alt='Klara AI Assistant'
					width={24}
					height={24}
					className='h-6 w-6'
				/>
				<p className='text-xl font-semibold text-text_primary'>Klara 1.5</p>
				{stats && chatState === EChatState.EXPANDED && (
					<>
						<p className='rounded-full bg-klara_stats_bg px-2 py-1 text-xs font-normal text-klara_stats_text'>{formatter.format(stats?.totalConversations || 0)} total messages</p>
						<p className='rounded-full bg-klara_stats_bg px-2 py-1 text-xs font-normal text-klara_stats_text'>{stats?.totalUsers} users</p>
					</>
				)}
			</div>
			<div className={styles.chatUIControls}>
				{chatState === EChatState.EXPANDED && (
					<Link
						href='/klara-guide'
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-1 rounded-lg border border-text_pink px-3 py-1 text-sm font-medium text-text_pink'
					>
						<NotebookText className='size-4' />
						Refer Usage Guide
					</Link>
				)}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type='button'
							aria-label='expand'
							onClick={() => setChatState(chatState === EChatState.EXPANDED ? EChatState.EXPANDED_SMALL : EChatState.EXPANDED)}
							className={`${styles.controlIcon} border-none bg-green-400 outline-none focus:outline-none`}
						>
							{chatState === EChatState.EXPANDED ? <CgArrowsScrollV className='size-4 rotate-45 text-white' /> : <CgArrowsVAlt className='size-4 rotate-45 text-white' />}
						</button>
					</TooltipTrigger>
					<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
						<p>{chatState === EChatState.EXPANDED ? 'minimize' : 'expand'}</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type='button'
							onClick={() => setChatState(chatState === EChatState.COLLAPSED ? EChatState.EXPANDED_SMALL : EChatState.COLLAPSED)}
							aria-label='collapse'
							className={`${styles.controlIcon} border-none bg-yellow-400 outline-none focus:outline-none`}
						>
							{chatState === EChatState.COLLAPSED ? <IoChevronUp className='size-4 text-white' /> : <IoChevronDown className='size-4 text-white' />}
						</button>
					</TooltipTrigger>
					<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
						<p>{chatState === EChatState.COLLAPSED ? 'open' : 'collapse'}</p>
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
			<div className='ml-auto flex items-center gap-2 text-text_pink md:hidden'>
				<button
					type='button'
					aria-label='history'
					className='cursor-pointer border-none outline-none focus:outline-none'
					onClick={openMobileHistory}
				>
					<Image
						src={HistoryIcon}
						alt='history'
						width={24}
						height={24}
						className='size-6'
					/>
				</button>
				<button
					type='button'
					aria-label='close'
					onClick={() => setChatState(EChatState.CLOSED)}
					className='cursor-pointer border-none outline-none focus:outline-none'
				>
					<IoClose className='size-6 text-gray-500' />
				</button>
			</div>
		</div>
	);
}

export default ChatHeader;
