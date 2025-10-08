// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback } from 'react';
import { EChatState } from '@/_shared/types';
import { useChatState } from '@/hooks/useChatState';
import Image from 'next/image';
import NewChatIcon from '@assets/klara/start-chat-icon.svg';
import { useChatLogic } from './hooks/useChatLogic';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import styles from './ChatUI.module.scss';

function ChatUI() {
	const { chatState, setChatState } = useChatState();
	const { inputText, isLoading, isLoadingMessages, messages, streamingMessage, mascotType, handleInputChange, submitMessage, handleStopGeneration, handleNewChat } = useChatLogic();

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

	if (chatState === EChatState.CLOSED) {
		return null;
	}

	return (
		<div className={styles.chatUI}>
			<div className={styles.container}>
				<ChatHeader
					chatState={chatState}
					setChatState={setChatState}
				/>
				{chatState === EChatState.EXPANDED_SMALL && (
					<>
						<ChatMessages
							messages={messages}
							streamingMessage={streamingMessage}
							mascotType={mascotType}
							isLoadingMessages={isLoadingMessages}
							onFollowUpClick={handleFollowUpClick}
						/>
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
									onClick={handleNewChat}
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
	);
}

export default ChatUI;
