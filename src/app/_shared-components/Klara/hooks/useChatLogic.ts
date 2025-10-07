// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useCallback, useEffect } from 'react';
import { IConversationMessage, Source } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { useActiveChatId } from '@/hooks/useActiveChatId';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

type MascotType = 'welcome' | 'loading' | 'error' | 'taskdone' | null;

interface StreamingData {
	conversationId?: string;
	content?: string;
	sources?: Source[];
	followUpQuestions?: string[];
}

interface StreamingState {
	aiMessage: IConversationMessage | null;
	accumulatedText: string;
}

export const useChatLogic = () => {
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useActiveChatId();
	const [inputText, setInputText] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [messages, setMessages] = useState<IConversationMessage[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [streamingMessage, setStreamingMessage] = useState<IConversationMessage | null>(null);
	const [abortController, setAbortController] = useState<AbortController | null>(null);
	const [mascotType, setMascotType] = useState<MascotType>('welcome');
	const [hasUserStartedTyping, setHasUserStartedTyping] = useState(false);

	const generateMessageId = useCallback(() => {
		return Date.now().toString() + Math.random().toString(36).substring(2, 9);
	}, []);

	const addMessage = useCallback((message: IConversationMessage) => {
		setMessages((prev) => [...prev, message]);
	}, []);

	const handleStopGeneration = useCallback(() => {
		if (abortController) {
			abortController.abort();
			setAbortController(null);
		}
		setIsLoading(false);

		if (streamingMessage) {
			addMessage({ ...streamingMessage, isStreaming: false });
		}

		setStreamingMessage(null);
		setMascotType(null);
	}, [abortController, streamingMessage, addMessage]);

	const handleStreamingData = useCallback(
		(data: StreamingData, state: StreamingState): StreamingState => {
			if (data.conversationId && !conversationId) {
				setConversationId(data.conversationId);
				setActiveChatId(data.conversationId);
			}

			if (!data.content) return state;

			const newState = { ...state };
			if (!newState.aiMessage) {
				newState.aiMessage = {
					id: generateMessageId(),
					text: '',
					sender: 'ai',
					timestamp: Date.now(),
					isStreaming: true
				};
			}

			newState.accumulatedText = state.accumulatedText + data.content;
			setStreamingMessage({
				...newState.aiMessage,
				text: newState.accumulatedText,
				sources: data.sources,
				followUpQuestions: data.followUpQuestions
			});

			return newState;
		},
		[conversationId, generateMessageId, setActiveChatId]
	);

	const processStreamingResponse = useCallback(
		async (response: Response) => {
			const reader = response.body?.getReader();
			if (!reader) return;

			const decoder = new TextDecoder();
			const state: StreamingState = {
				aiMessage: null,
				accumulatedText: ''
			};
			let firstChunkReceived = false;

			try {
				const processLine = (line: string): void => {
					if (!line.startsWith('data: ')) return;

					const data = line.slice(6);
					if (data === '[DONE]') {
						if (state.aiMessage) {
							const finalMessage: IConversationMessage = {
								...state.aiMessage,
								text: state.accumulatedText,
								isStreaming: false
							};
							addMessage(finalMessage);
							setStreamingMessage(null);
							setMascotType('taskdone');
						}
						return;
					}

					try {
						const parsed = JSON.parse(data);
						Object.assign(state, handleStreamingData(parsed, state));
					} catch {
						// Ignore parsing errors for individual chunks
					}
				};

				const processChunk = (chunk: Uint8Array): void => {
					if (!firstChunkReceived) {
						firstChunkReceived = true;
						setMascotType(null);
					}

					const text = decoder.decode(chunk);
					text.split('\n').filter(Boolean).forEach(processLine);
				};

				const readChunks = async (): Promise<void> => {
					const { value, done } = await reader.read();
					if (done) return;
					processChunk(value);
					await readChunks();
				};

				await readChunks();
			} finally {
				reader.releaseLock();
			}
		},
		[addMessage, handleStreamingData]
	);

	const submitMessage = useCallback(
		async (messageText: string) => {
			if (!messageText.trim() || isLoading) return;

			const userMessage: IConversationMessage = {
				id: generateMessageId(),
				text: messageText.trim(),
				sender: 'user',
				timestamp: Date.now()
			};

			addMessage(userMessage);
			setInputText('');
			setHasUserStartedTyping(false);
			setIsLoading(true);
			setMascotType('loading');

			const controller = new AbortController();
			setAbortController(controller);

			try {
				const response = await fetch('/api/v2/klara/send-message', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						message: userMessage.text,
						userId: user?.id || 'guest_user',
						conversationId: conversationId || undefined
					}),
					signal: controller.signal
				});

				if (!response.ok) {
					throw new Error(`Failed to get response: ${response.status}`);
				}

				await processStreamingResponse(response);
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return;

				const errorMessage: IConversationMessage = {
					id: generateMessageId(),
					text: 'Sorry, I encountered an error. Please try again.',
					sender: 'ai',
					timestamp: Date.now()
				};
				addMessage(errorMessage);
				setMascotType('error');
			} finally {
				setIsLoading(false);
				setAbortController(null);
				if (mascotType === 'loading') {
					setMascotType(null);
				}
			}
		},
		[isLoading, generateMessageId, addMessage, user, conversationId, mascotType, processStreamingResponse]
	);

	const fetchMessages = useCallback(async (chatId: string) => {
		setIsLoadingMessages(true);
		try {
			const response = await NextApiClientService.getConversationMessages({ conversationId: chatId });
			if (response.data) {
				setMessages(response.data);
				setMascotType(null);
			}
		} catch {
			// Error handling is done by the error boundary
		} finally {
			setIsLoadingMessages(false);
		}
	}, []);

	useEffect(() => {
		if (activeChatId && activeChatId !== conversationId) {
			setConversationId(activeChatId);
			setMessages([]);
			fetchMessages(activeChatId);
		} else if (!activeChatId && conversationId) {
			setConversationId(null);
			setMessages([]);
			setMascotType('welcome');
			setHasUserStartedTyping(false);
		}
	}, [activeChatId, conversationId, fetchMessages]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			setInputText(value);

			if (!hasUserStartedTyping && value.length > 0) {
				setHasUserStartedTyping(true);
				if (mascotType === 'welcome' || mascotType === 'taskdone') {
					setMascotType(null);
				}
			}
		},
		[hasUserStartedTyping, mascotType]
	);

	const handleNewChat = useCallback(() => {
		setActiveChatId(null);
		setConversationId(null);
		setMessages([]);
		setMascotType('welcome');
		setHasUserStartedTyping(false);
		setInputText('');
	}, [setActiveChatId]);

	return {
		inputText,
		isLoading,
		isLoadingMessages,
		messages,
		streamingMessage,
		mascotType,
		handleInputChange,
		submitMessage,
		handleStopGeneration,
		handleNewChat
	};
};
