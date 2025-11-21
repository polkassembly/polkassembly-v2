// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { IConversationMessage, IChatDataSource } from '@/_shared/types';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import Link from 'next/link';

interface Props {
	message: IConversationMessage;
	onFollowUpClick: (question: string) => void;
	userId?: string;
	conversationId?: string;
	isStreaming?: boolean;
	messages?: IConversationMessage[];
}

function SourceLink({ source }: { source: IChatDataSource }) {
	return (
		<a
			href={source.url}
			target='_blank'
			rel='noopener noreferrer'
			className='block text-xs text-blue-400 hover:underline'
		>
			{source.title}
		</a>
	);
}

function FollowUpButton({ question, onClick }: { question: string; onClick: () => void }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='block w-full rounded bg-gray-100 p-2 text-left text-xs text-gray-700 hover:bg-gray-200'
		>
			{question}
		</button>
	);
}

function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatMessage({ message, onFollowUpClick, userId, conversationId, isStreaming = false, messages = [] }: Props) {
	const isUserMessage = message.sender === 'user';
	const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

	// Find the previous user message for context
	const getPreviousUserMessage = () => {
		const currentIndex = messages.findIndex((m) => m.id === message.id);
		if (currentIndex === -1) return null;

		// Look backwards from current message to find the last user message
		for (let i = currentIndex - 1; i >= 0; i -= 1) {
			if (messages[i]?.sender === 'user') {
				return messages[i]?.text;
			}
		}
		return null;
	};

	const previousQueryText = getPreviousUserMessage();

	const handleLike = async () => {
		setFeedback('like');

		// Record the like action in the database immediately
		try {
			await NextApiClientService.submitKlaraFeedback({
				firstName: 'Anonymous',
				lastName: 'User',
				email: 'anonymous@like.action',
				feedbackText: 'User clicked like button',
				userId: userId || '',
				conversationId: conversationId || '',
				messageId: message.id,
				rating: 5,
				feedbackType: 'like_click',
				queryText: previousQueryText || 'Query not available',
				responseText: message.text
			});
			console.log('Like action recorded');
		} catch (error) {
			console.error('Failed to record like:', error);
		}
	};

	const handleDislike = async () => {
		setFeedback('dislike');

		// Record the dislike action in the database immediately
		try {
			await NextApiClientService.submitKlaraFeedback({
				firstName: 'Anonymous',
				lastName: 'User',
				email: 'anonymous@dislike.action',
				feedbackText: 'User clicked dislike button',
				userId: userId || '',
				conversationId: conversationId || '',
				messageId: message.id,
				rating: 1, // 1 for dislike
				feedbackType: 'dislike_click',
				queryText: previousQueryText || 'Query not available',
				responseText: message.text
			});
			console.log('Dislike action recorded');
		} catch (error) {
			console.error('Failed to record dislike:', error);
		}
	};

	return (
		<div className={`flex w-full ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
			<div className='max-w-[80%] break-words'>
				<div className={`break-words rounded-xl px-3 py-2 ${isUserMessage ? 'bg-klara_user_msg_bg text-white' : 'bg-klara_ai_msg_bg text-black dark:text-white'}`}>
					{isUserMessage ? (
						<p className='whitespace-pre-wrap text-sm'>{message.text}</p>
					) : (
						<MarkdownViewer
							markdown={message.text}
							className='text-sm [&_.markdown-body]:!m-0 [&_.markdown-body]:!p-0 [&_.markdown-body]:!text-sm [&_.markdown-body]:text-black [&_.markdown-body_a]:!text-blue-600 hover:[&_.markdown-body_a]:!underline [&_.markdown-body_blockquote]:!text-sm [&_.markdown-body_code]:!text-xs [&_.markdown-body_h1]:!text-base [&_.markdown-body_h2]:!text-base [&_.markdown-body_h3]:!text-sm [&_.markdown-body_h4]:!text-sm [&_.markdown-body_h5]:!text-xs [&_.markdown-body_h6]:!text-xs [&_.markdown-body_p]:!mb-2 [&_.markdown-body_pre]:!text-xs'
						/>
					)}

					{(message.sources?.length ?? 0) > 0 && message.sources && (
						<div className='mt-2 border-t border-gray-200 pt-2'>
							<p className='text-xs opacity-70'>Sources:</p>
							{message.sources.slice(0, 3).map((source) => (
								<SourceLink
									key={source.url}
									source={source}
								/>
							))}
						</div>
					)}

					{(message.followUpQuestions?.length ?? 0) > 0 && message.followUpQuestions && (
						<div className='mt-3 space-y-1'>
							<p className='text-xs opacity-70'>Follow-up questions:</p>
							{message.followUpQuestions.map((question) => (
								<FollowUpButton
									key={question}
									question={question}
									onClick={() => onFollowUpClick(question)}
								/>
							))}
						</div>
					)}

					{/* Streaming indicator */}
					{message.isStreaming && (
						<div className='mt-1 flex items-center gap-1'>
							<div className='h-1 w-1 animate-pulse rounded-full bg-primary' />
							<div className='h-1 w-1 animate-pulse rounded-full bg-primary delay-100' />
							<div className='h-1 w-1 animate-pulse rounded-full bg-primary delay-200' />
						</div>
					)}

					{/* Like/Dislike Buttons - Only for AI responses */}
					{!isUserMessage && !isStreaming && (
						<div className='border-primary-100 mt-3 border-t pt-3'>
							<div className='flex items-center justify-between'>
								<p className='text-xs font-medium text-gray-600'>Was this helpful?</p>
								<div className='flex items-center space-x-2'>
									<button
										type='button'
										onClick={handleLike}
										className={`rounded-lg p-1 transition-all duration-200 ${
											feedback === 'like' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
										}`}
										title='Like this response'
									>
										<ThumbsUp className='size-4' />
									</button>
									<button
										type='button'
										onClick={handleDislike}
										className={`rounded-lg p-1 transition-all duration-200 ${
											feedback === 'dislike' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
										}`}
										title='Dislike this response'
									>
										<ThumbsDown className='size-4' />
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
				{/* Show feedback message and link when disliked */}
				{feedback === 'dislike' && (
					<div className='mt-3 rounded-lg border border-klara_active_chat_border bg-klara_active_chat_bg p-2'>
						<p className='text-xs font-medium text-klara_active_chat_border'>
							Help us improve! Send your feedback{' '}
							<Link
								href={`/klara-feedback?dislike=true&userId=${userId}&conversationId=${conversationId}&messageId=${message.id}`}
								target='_blank'
								rel='noopener noreferrer'
								className='font-medium text-klara_active_chat_border underline'
							>
								here
							</Link>
							.
						</p>
					</div>
				)}

				<div className={`mt-1 text-xs text-gray-500 ${isUserMessage ? 'text-right' : 'text-left'}`}>{formatTime(message.timestamp)}</div>
			</div>
		</div>
	);
}

export default ChatMessage;
