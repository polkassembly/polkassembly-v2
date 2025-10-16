// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IConversationMessage, Source } from '@/_shared/types';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';

interface Props {
	message: IConversationMessage;
	onFollowUpClick: (question: string) => void;
}

function SourceLink({ source }: { source: Source }) {
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

function ChatMessage({ message, onFollowUpClick }: Props) {
	const isUserMessage = message.sender === 'user';

	return (
		<div className={`flex w-full ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
			<div className={`max-w-[80%] rounded-xl px-3 py-2 ${isUserMessage ? 'bg-klara_user_msg_bg text-white' : 'bg-klara_ai_msg_bg text-black'}`}>
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
			</div>
		</div>
	);
}

export default ChatMessage;
