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
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './ExpandedChatModal.module.scss';
import ChatInput from './ChatInput';
import { ChatBanner } from '../ChatBanner';

export default function ExpandedChatModal({ open }: { open: boolean }) {
	const { chatState, setChatState } = useChatState();
	const { inputText, isLoading, isLoadingMessages, messages, streamingMessage, mascotType, conversationId, handleInputChange, submitMessage, handleStopGeneration, handleNewChat } =
		useChatLogic();
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useActiveChatId();

	const { data: conversations } = useQuery({
		queryKey: ['klara-conversations', user?.id],
		queryFn: async () => {
			const res = await NextApiClientService.getConversationHistory({ userId: user?.id.toString() ?? '', limit: 10 });
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
			<DialogContent className={cn(styles.chatModal, 'max-w-5xl !gap-0 rounded-xl [&>button]:hidden')}>
				<div className={styles.container}>
					<DialogHeader className='rounded-t-[10.5px] !border-b-0 bg-bg_modal !pb-0'>
						<DialogTitle className='flex items-center gap-x-2 text-xl font-semibold text-text_primary'>
							<ChatHeader
								chatState={chatState}
								setChatState={setChatState}
							/>
						</DialogTitle>
					</DialogHeader>
					<div className='flex w-full flex-grow rounded-b-[10.5px] bg-bg_modal'>
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
								<div className='flex flex-col items-center justify-center p-2'>
									<Image
										src={EmptyBox}
										alt='Empty HistoryBox'
										width={160}
										height={160}
									/>

									{!user?.id && (
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
							)}
						</div>

						<div className='flex h-[550px] w-3/4 flex-grow flex-col overflow-y-auto'>
							<ChatBanner chatState={chatState ?? EChatState.EXPANDED} />

							<ChatMessages
								messages={messages}
								streamingMessage={streamingMessage}
								mascotType={mascotType}
								isLoadingMessages={isLoadingMessages}
								onFollowUpClick={handleFollowUpClick}
								userId={user?.id?.toString()}
								conversationId={conversationId || undefined}
							/>
							<ChatInput
								inputText={inputText}
								isLoading={isLoading}
								isLoadingMessages={isLoadingMessages}
								isStreaming={!!streamingMessage?.isStreaming}
								onInputChange={handleInputChange}
								chatState={chatState ?? EChatState.EXPANDED}
								onSubmit={handleSubmit}
								onStopGeneration={handleStopGeneration}
							/>
							<div className='my-2 text-center text-xs text-text_primary'>
								<b>Privacy Note:</b> Chats are monitored to improve Klara’s responses and user experience. No personal data is shared externally.
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
