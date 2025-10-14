// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import { useChatLogic } from '@/app/_shared-components/Klara/hooks/useChatLogic';
import { useChatState } from '@/hooks/useChatState';
import ChatHeader from '@/app/_shared-components/Klara/components/ChatHeader';
import ChatMessages from '@/app/_shared-components/Klara/components/ChatMessages';
import Image from 'next/image';
import NewChatIcon from '@assets/klara/start-chat-blue-icon.svg';
import EmptyBox from '@assets/klara/empty-box.svg';
import React, { useCallback } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { useActiveChatId } from '@/hooks/useActiveChatId';
import { useQuery } from '@tanstack/react-query';
import { EChatState, IConversationHistory } from '@/_shared/types';
import styles from './ExpandedChatModal.module.scss';
import ChatInput from './ChatInput';
import { ChatBanner } from '../ChatBanner';

export default function ExpandedChatModal({ open }: { open: boolean }) {
	const { chatState, setChatState } = useChatState();
	const { inputText, isLoading, isLoadingMessages, messages, streamingMessage, mascotType, handleInputChange, submitMessage, handleStopGeneration, handleNewChat } = useChatLogic();
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useActiveChatId();

	const { data: conversations } = useQuery({
		queryKey: ['klara-conversations', user?.id],
		queryFn: async () => {
			const res = await NextApiClientService.getConversationHistory({ userId: user?.id.toString() ?? '' });
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

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			await submitMessage(inputText);
		},
		[submitMessage, inputText]
	);

	const handleFollowUpClick = useCallback(
		(question: string) => {
			setTimeout(() => submitMessage(question), 100);
		},
		[submitMessage]
	);

	return (
		<Dialog open={open}>
			<DialogContent className='max-w-4xl !gap-0 overflow-hidden rounded-xl [&>button]:hidden'>
				<div className={styles.container}>
					<DialogHeader className='rounded-t-[10.5px] !border-b-0 bg-bg_modal !pb-0'>
						<DialogTitle className='flex items-center gap-x-2 text-xl font-semibold text-text_primary'>
							<ChatHeader
								chatState={chatState}
								setChatState={setChatState}
							/>
						</DialogTitle>
					</DialogHeader>
					<div className='flex max-h-[80vh] w-full overflow-hidden rounded-b-[10.5px] bg-bg_modal'>
						<div className='w-1/4 border-r border-primary_border p-4'>
							<div className={styles.newChatBtnContainer}>
								<button
									type='button'
									onClick={handleNewChat}
									className={styles.newChatBtn}
								>
									<Image
										src={NewChatIcon}
										alt='new chat'
										width={24}
										height={24}
									/>
									New Chat
								</button>
							</div>
							<p className='mb-2 mt-4 border-t border-dashed border-primary_border pt-4 text-sm font-medium text-basic_text'>CHAT HISTORY</p>
							{conversations?.length ? (
								<div className={styles.conversations}>
									{conversations?.map((conversation: IConversationHistory) => (
										<button
											type='button'
											onClick={() => openChat(conversation.id)}
											key={conversation.id}
											className={`line-clamp-1 border-b p-2 text-left text-sm font-semibold capitalize leading-loose text-text_primary first:border-t ${activeChatId === conversation.id ? 'border-y border-klara_active_chat_border bg-klara_active_chat_bg' : 'border-primary_border'}`}
										>
											{conversation.title}
										</button>
									))}
								</div>
							) : (
								<div className='flex items-center justify-center p-2'>
									<Image
										src={EmptyBox}
										alt='Klara Avatar'
										width={160}
										height={160}
									/>
								</div>
							)}
						</div>

						<div className='w-3/4'>
							<ChatBanner chatState={chatState ?? EChatState.EXPANDED} />
							<div className={`${styles.hide_scrollbar} h-96 overflow-y-auto`}>
								<ChatMessages
									messages={messages}
									streamingMessage={streamingMessage}
									mascotType={mascotType}
									isLoadingMessages={isLoadingMessages}
									onFollowUpClick={handleFollowUpClick}
								/>
							</div>
							<ChatInput
								inputText={inputText}
								isLoading={isLoading}
								isLoadingMessages={isLoadingMessages}
								isStreaming={!!streamingMessage?.isStreaming}
								onInputChange={handleInputChange}
								onSubmit={handleSubmit}
								onStopGeneration={handleStopGeneration}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
