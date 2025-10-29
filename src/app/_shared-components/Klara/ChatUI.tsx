// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback } from 'react';
import { EChatState } from '@/_shared/types';
import { useKlara } from '@/hooks/useKlara';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import NewChatIcon from '@assets/klara/start-chat-icon.svg';
import { usePathname, useRouter } from 'next/navigation';
import { useChatLogic } from './hooks/useChatLogic';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import styles from './ChatUI.module.scss';
import { ChatBanner } from './ChatBanner';
import ExpandedChatModal from './components/ExpandedChatModal';

function ChatUI({ setIsMobileHistoryOpen }: { setIsMobileHistoryOpen: (isOpen: boolean) => void }) {
	const { chatState, setChatState } = useKlara();
	const { user } = useUser();
	const router = useRouter();
	const pathname = usePathname();
	const chat = useChatLogic();
	const { inputText, isLoading, isLoadingMessages, messages, streamingMessage, mascotType, handleInputChange, submitMessage, handleStopGeneration, handleNewChat } = chat;

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!user?.id) {
				router.push('/login');
				return;
			}
			await submitMessage(inputText);
		},
		[submitMessage, inputText, user?.id, pathname, router]
	);

	const handleFollowUpClick = useCallback(
		(question: string) => {
			if (!user?.id) {
				router.push('/login');
				return;
			}
			setTimeout(() => submitMessage(question), 100);
		},
		[submitMessage, user?.id, pathname, router]
	);

	if (chatState === EChatState.CLOSED) {
		return null;
	}

	return (
		<>
			<div className={`${styles.chatUI} ${chatState === EChatState.EXPANDED ? 'hidden' : ''}`}>
				<div className={styles.container}>
					<ChatHeader
						openMobileHistory={() => setIsMobileHistoryOpen(true)}
						chatState={chatState}
						setChatState={setChatState}
					/>
					{chatState === EChatState.EXPANDED_SMALL && (
						<>
							<ChatBanner chatState={chatState} />
							<div className='flex w-full flex-grow flex-col md:h-80'>
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
							{messages.length > 0 && !isLoading && !streamingMessage && (
								<div className='w-full'>
									<button
										type='button'
										onClick={() => {
											if (!user?.id) {
												router.push('/login');
												return;
											}
											handleNewChat();
										}}
										className={styles.newChatBtn}
									>
										<Image
											src={NewChatIcon}
											alt='new chat'
											width={24}
											height={24}
										/>
										Start a new chat
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
			<ExpandedChatModal
				open={chatState === EChatState.EXPANDED}
				chat={chat}
			/>
		</>
	);
}

export default ChatUI;
