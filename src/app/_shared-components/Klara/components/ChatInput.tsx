// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from '../ChatUI.module.scss';

interface Props {
	inputText: string;
	isLoading: boolean;
	isLoadingMessages: boolean;
	isStreaming: boolean;
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
			<div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-500'>
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
			className={`flex h-8 w-8 items-center justify-center rounded-full ${disabled ? 'border border-gray-500 bg-page_background' : 'border-none bg-bg_pink'}`}
			aria-label='send'
		>
			<div className={`flex h-8 w-8 items-center justify-center rounded-full ${disabled ? 'border border-gray-500 bg-page_background' : 'border-none bg-bg_pink'}`}>
				<ArrowUp className={`size-5 ${disabled ? 'text-gray-500' : 'text-white'}`} />
			</div>
		</button>
	);
}

function ChatInput({ inputText, isLoading, isLoadingMessages, isStreaming, onInputChange, onSubmit, onStopGeneration }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<form
			onSubmit={onSubmit}
			className={styles.chatUIInput}
		>
			<input
				ref={inputRef}
				type='text'
				value={inputText}
				onChange={onInputChange}
				placeholder='Ask Klara anything'
				disabled={isLoading || isLoadingMessages}
				className='w-full bg-transparent !p-0 focus:border-transparent focus:outline-none focus:ring-0 disabled:opacity-50'
			/>
			{isLoading || isStreaming ? <StopButton onClick={onStopGeneration} /> : <SendButton disabled={!inputText.trim() || isLoading || isLoadingMessages} />}
		</form>
	);
}

export default ChatInput;
