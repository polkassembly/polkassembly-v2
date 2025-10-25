// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/app/_shared-components/Collapsible';
import { IoChevronDown } from '@react-icons/all-files/io5/IoChevronDown';
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useKlara } from '@/hooks/useKlara';
import KlaraAvatar from '@assets/klara/avatar.svg';
import EmptyBox from '@assets/klara/empty-box.svg';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IConversationHistory } from '@/_shared/types';
import styles from './ChatsHistory.module.scss';
import { LoadingSpinner } from '../LoadingSpinner';

function ChatsHistory() {
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useKlara();

	const { data: conversations, isLoading } = useQuery({
		queryKey: ['klara-conversations', user?.id],
		queryFn: async () => {
			const res = await NextApiClientService.getConversationHistory({ userId: user?.id.toString() ?? '', limit: 4 });
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
			<div className={styles.container}>
				<div className={styles.content}>
					<LoadingSpinner message='Loading conversations...' />
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				{conversations?.length ? (
					<Collapsible defaultOpen>
						<CollapsibleTrigger className='flex w-full items-center justify-between gap-5 text-sm font-medium text-basic_text'>
							<span>CHAT HISTORY</span>
							<IoChevronDown className='h-5 w-5' />
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className={styles.conversations}>
								{conversations?.map((conversation: IConversationHistory) => (
									<button
										type='button'
										onClick={() => openChat(conversation.id)}
										key={conversation.id}
										className={`line-clamp-1 border-b p-2 text-left text-sm font-semibold capitalize leading-loose text-text_primary last:border-b-0 ${activeChatId === conversation.id ? 'border-y border-klara_active_chat_border bg-klara_active_chat_bg first:border-t-0 last:border-b-0' : 'border-primary_border'}`}
									>
										{conversation.title}
									</button>
								))}
							</div>
						</CollapsibleContent>
					</Collapsible>
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
							<div className='flex items-center gap-2'>
								<Image
									src={KlaraAvatar}
									alt='Klara Avatar'
									width={36}
									height={36}
								/>
								<p className='text-left text-[11px] font-semibold text-text_primary'>Hi, I am Klara, ask me about your governance interests</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default ChatsHistory;
