// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import KlaraAvatar from '@assets/klara/avatar.svg';
import { EChatState, IConversationMessage } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { KLARA_CHAT_SUGGESTIONS } from '@/_shared/_constants/klaraChatSuggestions';
import Mascot from '../Mascot';
import ChatMessage from './ChatMessage';
import styles from '../ChatUI.module.scss';

interface Props {
	messages: IConversationMessage[];
	streamingMessage: IConversationMessage | null;
	mascotType: 'welcome' | 'loading' | 'error' | null;
	isLoadingMessages: boolean;
	chatState?: EChatState;
	onFollowUpClick: (question: string) => void;
	userId?: string;
	conversationId?: string;
}

function WelcomeMessage() {
	return (
		<div className='flex flex-col items-center justify-center p-8 text-center'>
			<Image
				src={KlaraAvatar}
				alt='Klara'
				width={48}
				height={48}
				className='mb-4 h-12 w-12 opacity-50'
			/>
			<p className='text-lg font-medium text-text_primary'>Welcome to Klara!</p>
			<p className='text-text_secondary text-sm'>Ask me anything about Polkadot governance.</p>
		</div>
	);
}

function ChatSuggestions({ onFollowUpClick }: { onFollowUpClick: (suggestion: string) => void }) {
	return (
		<div className='flex flex-wrap items-center justify-center gap-3 p-3'>
			{KLARA_CHAT_SUGGESTIONS.map((suggestion) => (
				<button
					key={suggestion}
					type='button'
					className='rounded-full border border-primary_border px-3 py-1 text-xs text-basic_text transition-all duration-200 hover:scale-105'
					onClick={() => onFollowUpClick(suggestion)}
				>
					{suggestion}
				</button>
			))}
		</div>
	);
}

function ChatMessages({ messages, streamingMessage, mascotType, isLoadingMessages, onFollowUpClick, userId, conversationId, chatState }: Props) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [isUserScrolling, setIsUserScrolling] = useState(false);

	const { user } = useUser();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const isNearBottom = useCallback(() => {
		const container = messagesContainerRef.current;
		if (!container) return true;

		const { scrollTop, scrollHeight, clientHeight } = container;
		// Consider "near bottom" if within 100px of the bottom
		return scrollHeight - scrollTop - clientHeight < 100;
	}, []);

	const handleScroll = useCallback(() => {
		if (isNearBottom()) {
			setIsUserScrolling(false);
		} else {
			setIsUserScrolling(true);
		}
	}, [isNearBottom]);

	useEffect(() => {
		const container = messagesContainerRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
			return () => container.removeEventListener('scroll', handleScroll);
		}
		return undefined;
	}, [handleScroll]);

	useEffect(() => {
		// Only auto-scroll if user hasn't manually scrolled up
		if (!isUserScrolling) {
			scrollToBottom();
		}
	}, [messages, streamingMessage, isUserScrolling]);

	if (isLoadingMessages) {
		return (
			<LoadingSpinner
				className='py-8'
				message='Loading messages...'
			/>
		);
	}

	return (
		<div
			ref={messagesContainerRef}
			className={`${chatState === EChatState.EXPANDED ? 'flex-grow p-4' : styles.chatUIBody} ${styles.hide_scrollbar}`}
		>
			{messages?.length ? (
				<div className='flex w-full flex-grow flex-col gap-3'>
					{messages.map((message) => (
						<ChatMessage
							key={message.id}
							message={message}
							onFollowUpClick={onFollowUpClick}
							userId={userId}
							conversationId={conversationId}
							messages={messages}
						/>
					))}

					{mascotType && mascotType !== 'welcome' && <Mascot type={mascotType} />}
					{streamingMessage && (
						<ChatMessage
							message={streamingMessage}
							onFollowUpClick={onFollowUpClick}
							userId={userId}
							conversationId={conversationId}
							isStreaming
							messages={messages}
						/>
					)}
					<div ref={messagesEndRef} />
				</div>
			) : (
				<div className={`flex flex-grow flex-col items-center justify-center gap-2 ${chatState === EChatState.EXPANDED ? 'min-h-[400px]' : ''}`}>
					{user?.id ? (
						<>
							<h1 className='text-center text-lg font-bold text-text_primary'>Start New Conversation</h1>
							<div className='flex flex-col items-center justify-center'>
								{!streamingMessage && !mascotType && <WelcomeMessage />}
								{!streamingMessage && mascotType === 'welcome' && <ChatSuggestions onFollowUpClick={onFollowUpClick} />}
							</div>
						</>
					) : (
						<div className='flex h-96 flex-col items-center justify-center gap-4 p-4'>
							<div className='flex flex-col items-center gap-2'>
								<Image
									src={KlaraAvatar}
									alt='Klara Avatar'
									width={120}
									height={120}
								/>
								<p className='text-center text-sm font-semibold text-text_primary'>Hi, I am Klara, ask me about your governance interests</p>
							</div>
							<p className='flex items-center justify-center gap-1 text-center text-lg font-semibold text-text_primary'>
								<Link
									href='/login'
									className='text-text_pink underline'
								>
									Login
								</Link>
								<span>to begin conversations</span>
							</p>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			)}
		</div>
	);
}

export default ChatMessages;
