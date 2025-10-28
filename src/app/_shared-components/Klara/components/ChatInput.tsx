// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { EChatState } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import styles from '../ChatUI.module.scss';

interface Props {
	inputText: string;
	isLoading: boolean;
	isLoadingMessages: boolean;
	isStreaming: boolean;
	chatState?: EChatState;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	onStopGeneration: () => void;
}

function StopButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='flex items-center justify-center border-none !p-0 outline-none focus:border-none focus:outline-none focus:ring-0'
			aria-label='stop generation'
		>
			<div className='flex h-7 w-7 items-center justify-center rounded-full bg-red-500'>
				<div className='h-3 w-3 rounded-sm bg-white' />
			</div>
		</button>
	);
}

function SendButton({ disabled }: { disabled: boolean }) {
	return (
		<button
			type='submit'
			disabled={disabled}
			className='flex items-center justify-center rounded-full border-none outline-none'
			aria-label='send'
		>
			<div className={`flex h-7 w-7 items-center justify-center rounded-full ${disabled ? 'border border-gray-500 bg-page_background' : 'border-none bg-bg_pink'}`}>
				<ArrowUp className={`size-4 ${disabled ? 'text-gray-500' : 'text-white'}`} />
			</div>
		</button>
	);
}

function ChatInput({ inputText, isLoading, isLoadingMessages, isStreaming, chatState, onInputChange, onSubmit, onStopGeneration }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { user } = useUser();

	return (
		<form
			onSubmit={onSubmit}
			className={`${styles.chatUIInput} ${chatState === EChatState.EXPANDED ? '!shadow-none' : ''} mt-auto`}
		>
			<div className={`flex w-full items-center gap-2 ${chatState === EChatState.EXPANDED ? 'rounded-full border border-primary_border px-3 py-1' : ''}`}>
				<input
					ref={inputRef}
					type='text'
					value={inputText}
					onChange={onInputChange}
					placeholder='Ask Klara anything'
					disabled={!user?.id || isLoading || isLoadingMessages}
					className='flex-grow bg-transparent !p-0 focus:border-transparent focus:outline-none focus:ring-0 disabled:opacity-50'
				/>
				{isLoading || isStreaming ? <StopButton onClick={onStopGeneration} /> : <SendButton disabled={!inputText.trim() || isLoading || isLoadingMessages} />}
			</div>
		</form>
	);
}

export default ChatInput;
