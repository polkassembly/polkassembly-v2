// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import KlaraAvatar from '@assets/klara/avatar.svg';
import { IConversationMessage } from '@/_shared/types';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { KALRA_CHAT_SUGGESTIONS } from '@/_shared/_constants/klaraChatSuggestions';
import Mascot from '../Mascot';
import ChatMessage from './ChatMessage';
import styles from '../ChatUI.module.scss';

interface Props {
	messages: IConversationMessage[];
	streamingMessage: IConversationMessage | null;
	mascotType: 'welcome' | 'loading' | 'error' | 'taskdone' | null;
	isLoadingMessages: boolean;
	onFollowUpClick: (question: string) => void;
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
			{KALRA_CHAT_SUGGESTIONS.map((suggestion) => (
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

function StreamingMessage({ message }: { message: IConversationMessage }) {
	return (
		<div className='flex justify-start'>
			<div className='bg-section_light_container max-w-[80%] rounded-lg p-3 text-text_primary'>
				<MarkdownViewer
					markdown={message.text}
					className='text-sm [&_.markdown-body]:!m-0 [&_.markdown-body]:!p-0 [&_.markdown-body]:!text-sm [&_.markdown-body]:text-text_primary [&_.markdown-body_a]:!text-text_pink hover:[&_.markdown-body_a]:!underline [&_.markdown-body_blockquote]:!text-sm [&_.markdown-body_code]:!text-xs [&_.markdown-body_h1]:!text-base [&_.markdown-body_h2]:!text-base [&_.markdown-body_h3]:!text-sm [&_.markdown-body_h4]:!text-sm [&_.markdown-body_h5]:!text-xs [&_.markdown-body_h6]:!text-xs [&_.markdown-body_p]:!mb-2 [&_.markdown-body_pre]:!text-xs'
				/>
				{message.isStreaming && (
					<div className='mt-1 flex items-center gap-1'>
						<div className='h-1 w-1 animate-pulse rounded-full bg-primary' />
						<div className='h-1 w-1 animate-pulse rounded-full bg-primary delay-100' />
						<div className='h-1 w-1 animate-pulse rounded-full bg-primary delay-200' />
					</div>
				)}
			</div>
		</div>
	);
}

function ChatMessages({ messages, streamingMessage, mascotType, isLoadingMessages, onFollowUpClick }: Props) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, streamingMessage]);

	if (isLoadingMessages) {
		return (
			<LoadingSpinner
				className='py-8'
				message='Loading messages...'
			/>
		);
	}

	return (
		<div className={styles.chatUIBody}>
			<div className='flex h-72 flex-col items-center justify-center'>
				{!messages.length && !streamingMessage && !mascotType && <WelcomeMessage />}
				{!messages.length && !streamingMessage && mascotType === 'welcome' && <ChatSuggestions onFollowUpClick={onFollowUpClick} />}
			</div>

			<div className='flex flex-col gap-3'>
				{messages.map((message) => (
					<ChatMessage
						key={message.id}
						message={message}
						onFollowUpClick={onFollowUpClick}
					/>
				))}

				{mascotType && mascotType !== 'welcome' && <Mascot type={mascotType} />}
				{streamingMessage && <StreamingMessage message={streamingMessage} />}
			</div>
		</div>
	);
}

export default ChatMessages;
