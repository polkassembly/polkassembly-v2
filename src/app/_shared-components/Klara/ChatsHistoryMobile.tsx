// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useKlara } from '@/hooks/useKlara';
import KlaraAvatar from '@assets/klara/avatar.svg';
import EmptyBox from '@assets/klara/empty-box.svg';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import HistoryIcon from '@assets/klara/history.svg';
import { IConversationHistory } from '@/_shared/types';
import { IoClose } from '@react-icons/all-files/io5/IoClose';
import Link from 'next/link';
import styles from './ChatsHistory.module.scss';
import uiStyles from './ChatUI.module.scss';
import { LoadingSpinner } from '../LoadingSpinner';

function ChatsHistoryMobile({ onClose }: { onClose: () => void }) {
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useKlara();

	const { data: conversations, isLoading } = useQuery({
		queryKey: ['klara-conversations', user?.id],
		queryFn: async () => {
			const res = await NextApiClientService.getConversationHistory({ userId: user?.id.toString() ?? '', limit: 15 });
			if (!res.data) {
				throw new Error('Network response was not ok');
			}
			return res.data;
		},
		enabled: !!user?.id
	});

	const openChat = useCallback(
		(id: string) => {
			setActiveChatId(id ?? null);
		},
		[setActiveChatId]
	);

	if (isLoading) {
		return (
			<div className={styles.mobileContainer}>
				<div className={styles.mobileContent}>
					<LoadingSpinner message='Loading conversations...' />
				</div>
			</div>
		);
	}

	return (
		<div className={styles.mobileContainer}>
			<div className={styles.mobileContent}>
				<div className={uiStyles.chatUIHeader}>
					<div className='flex items-center gap-2'>
						<Image
							src={HistoryIcon}
							alt='history'
							width={24}
							height={24}
							className='h-6 w-6'
						/>
						<p className='text-xl font-semibold text-text_primary'>Chat History</p>
					</div>
					<button
						type='button'
						aria-label='close'
						onClick={onClose}
						className='ml-auto cursor-pointer border-none outline-none focus:outline-none'
					>
						<IoClose className='size-6 text-gray-500' />
					</button>
				</div>
				{conversations?.length ? (
					<div className={styles.mobileConversations}>
						{conversations?.map((conversation: IConversationHistory) => (
							<button
								type='button'
								onClick={() => {
									openChat(conversation.id);
									onClose();
								}}
								key={conversation.id}
								className={`line-clamp-1 border-x border-b p-2 text-left text-sm font-semibold capitalize leading-loose text-text_primary last:border-b-0 ${activeChatId === conversation.id ? 'border-x-0 border-y border-klara_active_chat_border bg-klara_active_chat_bg first:rounded-t-xl' : 'border-primary_border'}`}
							>
								{conversation.title}
							</button>
						))}
					</div>
				) : (
					<div>
						<div className='flex items-center justify-center p-2'>
							<Image
								src={EmptyBox}
								alt='Empty HistoryBox'
								width={160}
								height={160}
							/>
						</div>
						<div>
							{user?.id ? (
								<div className='flex items-center gap-2'>
									<Image
										src={KlaraAvatar}
										alt='Klara Avatar'
										width={36}
										height={36}
									/>
									<p className='text-left text-[11px] font-semibold text-text_primary'>Hi, I am Klara, ask me about your governance interests</p>
								</div>
							) : (
								<p className='flex items-center justify-center gap-1 text-left text-[11px] font-semibold text-text_primary'>
									<Link
										href='/login'
										className='text-text_pink underline'
									>
										Login
									</Link>
									<span>to view your chat history</span>
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default ChatsHistoryMobile;
