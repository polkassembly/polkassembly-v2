// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useCallback, useEffect } from 'react';
import { createId } from '@paralleldrive/cuid2';
import { IConversationMessage, IChatDataSource, IConversationTurn } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { useKlara } from '@/hooks/useKlara';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQueryClient } from '@tanstack/react-query';
import { KLARA_CONVERSATION_HISTORY_LIMIT } from '@/_shared/_constants/klaraConstants';

type MascotType = 'welcome' | 'loading' | 'error' | null;

interface StreamingData {
	conversationId?: string;
	content?: string;
	sources?: IChatDataSource[];
	followUpQuestions?: string[];
}

interface StreamingState {
	aiMessage: IConversationMessage | null;
	accumulatedText: string;
}

export const useChatLogic = () => {
	const { user } = useUser();
	const { activeChatId, setActiveChatId } = useKlara();
	const queryClient = useQueryClient();
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
		return createId();
	}, []);

	const addMessage = useCallback((message: IConversationMessage) => {
		setMessages((prev) => [...prev, message]);
	}, []);

	// Build conversation history from local messages (client-side)
	const buildConversationHistory = useCallback((messagesToUse: IConversationMessage[], limit: number): IConversationTurn[] => {
		return messagesToUse
			.reduce<IConversationTurn[]>((history, message, index, array) => {
				if (message.sender === 'user' && index + 1 < array.length && array[index + 1].sender === 'ai') {
					history.push({
						query: message.text,
						response: array[index + 1].text,
						timestamp: new Date(message.timestamp).toISOString()
					});
				}
				return history;
			}, [])
			.slice(-limit);
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
				// Invalidate conversations query to refresh the list
				queryClient.invalidateQueries({ queryKey: ['klara-conversations', user?.id] });
			}

			if (!data.content) return state;

			const newState = { ...state };
			if (!newState.aiMessage) {
				newState.aiMessage = {
					id: generateMessageId(),
					text: '',
					sender: 'ai',
					conversationId: data.conversationId || '',
					timestamp: Date.now(),
					isStreaming: true
				};
			}

			newState.accumulatedText = state.accumulatedText + data.content;
			newState.aiMessage = {
				...newState.aiMessage,
				sources: data.sources ?? newState.aiMessage?.sources,
				followUpQuestions: data.followUpQuestions ?? newState.aiMessage?.followUpQuestions
			};
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
			if (!user?.id || !messageText.trim() || isLoading) return;

			const userMessage: IConversationMessage = {
				id: generateMessageId(),
				text: messageText.trim(),
				sender: 'user',
				conversationId: conversationId || '',
				timestamp: Date.now()
			};

			// Build conversation history from existing messages BEFORE adding new user message
			const historyLimit = KLARA_CONVERSATION_HISTORY_LIMIT || 5;
			const conversationHistory = buildConversationHistory(messages, historyLimit);

			// Add to local state immediately (optimistic UI)
			addMessage(userMessage);
			setInputText('');
			setHasUserStartedTyping(false);
			setIsLoading(true);
			setMascotType('loading');

			// Clean up any existing controller before creating a new one to avoid leaks
			if (abortController) {
				abortController.abort();
			}

			const controller = new AbortController();
			setAbortController(controller);

			try {
				const response = await NextApiClientService.klaraSendMessage({
					message: userMessage.text,
					userId: user?.id?.toString(),
					conversationId: conversationId || '',
					conversationHistory,
					signal: controller.signal
				});

				if (!response?.ok) {
					throw new Error(`Failed to get response: ${response?.status}`);
				}

				await processStreamingResponse(response);
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return;

				const errorMessage: IConversationMessage = {
					id: generateMessageId(),
					text: 'Sorry, I encountered an error. Please try again.',
					sender: 'ai',
					conversationId: conversationId || '',
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
		[isLoading, generateMessageId, addMessage, user, conversationId, mascotType, processStreamingResponse, abortController, messages, buildConversationHistory]
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
			setMascotType('error');
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
				if (mascotType === 'welcome') {
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
		conversationId,
		handleInputChange,
		submitMessage,
		handleStopGeneration,
		handleNewChat
	};
};
