// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { IConversationMessage, IChatResponse, IConversationTurn, IChatDataSource } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { createId } from '@paralleldrive/cuid2';
import { createHash } from 'node:crypto';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { KLARA_CONVERSATION_HISTORY_LIMIT } from '@/_shared/_constants/klaraConstants';
import { KlaraDatabaseService } from './database';
import { ExternalApiService } from './externalApiService';
import { validateRequestBody, shouldShowFollowUps, extractConversationHistory } from './utils/conversationUtils';
import { ensureTableExists, logQueryResponse } from './postgres';
import { RedisService } from '../redis_service';

export class ChatService {
	/**
	 * Hash message for deduplication purposes
	 */
	private static hashMessage(message: string, userId: string): string {
		const input = `${userId}:${message.trim().toLowerCase()}`;
		return createHash('sha256').update(input, 'utf8').digest('hex').substring(0, 16);
	}

	/**
	 * Parse and validate request body
	 */
	private static async parseAndValidateRequest(
		request: NextRequest
	): Promise<{ message: string; userId: string; conversationId?: string; conversationHistory?: IConversationTurn[] }> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let requestBody: any;
		try {
			requestBody = await request.json();
		} catch {
			throw new APIError(ERROR_CODES.INVALID_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, 'Invalid JSON payload');
		}

		const validation = validateRequestBody(requestBody);
		if (!validation.valid) {
			throw new APIError(ERROR_CODES.INVALID_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_REQUIRED_FIELDS);
		}

		return requestBody;
	}

	/**
	 * Check and set request deduplication lock
	 */
	private static async handleRequestDedup(userId: string, messageHash: string): Promise<void> {
		const isDuplicate = await RedisService.CheckKlaraRequestDedup(userId, messageHash);
		if (isDuplicate) {
			throw new APIError('DUPLICATE_REQUEST', StatusCodes.TOO_MANY_REQUESTS, 'Duplicate request detected. Please wait a moment before retrying.');
		}
		await RedisService.SetKlaraRequestDedup(userId, messageHash, 30);
	}

	/**
	 * Validate conversation ownership and determine if new conversation
	 */
	private static async validateConversation(conversationId: string | undefined, userId: string): Promise<{ activeConversationId: string; isNewConversation: boolean }> {
		if (!conversationId) {
			return { activeConversationId: '', isNewConversation: true };
		}

		const owns = await KlaraDatabaseService.verifyConversationOwnership(conversationId, userId);
		if (!owns) {
			throw new APIError('FORBIDDEN', StatusCodes.FORBIDDEN, 'Unauthorized conversation access');
		}

		return { activeConversationId: conversationId, isNewConversation: false };
	}

	/**
	 * Prepare conversation history from cache, client-provided, or DB
	 */
	private static async prepareConversationHistory(conversationId: string | undefined, clientHistory: IConversationTurn[] | undefined): Promise<IConversationTurn[]> {
		const historyLimit = KLARA_CONVERSATION_HISTORY_LIMIT || 5;

		if (clientHistory && Array.isArray(clientHistory) && clientHistory.length > 0) {
			return clientHistory.slice(-historyLimit);
		}

		if (!conversationId) {
			return [];
		}

		// Try cache first
		try {
			const cachedHistory = await RedisService.GetKlaraConversationHistory(conversationId);
			if (cachedHistory) {
				return JSON.parse(cachedHistory) as IConversationTurn[];
			}
		} catch (error) {
			console.warn('Failed to get cached history:', error);
		}

		// Fallback: Fetch from DB
		const conversationMessages = await KlaraDatabaseService.GetConversationMessages(conversationId, historyLimit);
		const finalHistory = extractConversationHistory(conversationMessages, historyLimit);

		// Cache the history for future requests (5 minutes TTL)
		if (finalHistory.length > 0) {
			RedisService.SetKlaraConversationHistory(conversationId, JSON.stringify(finalHistory), 300).catch((error) => {
				console.warn('Failed to cache conversation history:', error);
			});
		}

		return finalHistory;
	}

	/**
	 * Call external API with error handling and deduplication cleanup
	 */
	private static async callExternalAPIWithCleanup(
		message: string,
		userId: string,
		history: IConversationTurn[],
		messageHash: string
	): Promise<{ text: string; sources?: IChatDataSource[]; followUpQuestions?: string[]; remainingRequests?: number }> {
		try {
			return await ExternalApiService.callExternalAPI(message, userId, history);
		} catch (error) {
			RedisService.DeleteKlaraRequestDedup(userId, messageHash).catch((err) => {
				console.warn('Failed to clear deduplication lock on error:', err);
			});
			console.error('External API call failed:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get AI response. Please try again.');
		}
	}

	/**
	 * Create AI and user messages with metadata
	 */
	private static createMessages(
		message: string,
		responseText: string,
		conversationId: string,
		sources?: IChatDataSource[],
		followUpQuestions?: string[]
	): { userMessage: IConversationMessage; aiMessage: IConversationMessage } {
		const baseTimestamp = dayjs().valueOf();
		// Ensure user message timestamp is slightly earlier than AI message to maintain correct order
		const userMessage: IConversationMessage = {
			id: createId(),
			text: message,
			sender: 'user',
			conversationId,
			timestamp: baseTimestamp - 5
		};

		const aiMessage: IConversationMessage = {
			id: createId(),
			text: responseText,
			sender: 'ai',
			conversationId,
			timestamp: baseTimestamp
		};

		if (sources?.length) {
			aiMessage.sources = sources;
		}
		if (followUpQuestions?.length) {
			aiMessage.followUpQuestions = followUpQuestions;
		}

		return { userMessage, aiMessage };
	}

	/**
	 * Cleanup cache and deduplication locks
	 */
	private static async cleanup(conversationId: string | undefined, userId: string, messageHash: string): Promise<void> {
		const tasks: Promise<unknown>[] = [RedisService.DeleteKlaraRequestDedup(userId, messageHash)];

		if (conversationId) {
			tasks.push(RedisService.DeleteKlaraConversationHistory(conversationId));
		}

		await Promise.allSettled(tasks);
	}

	static async processMessage(request: NextRequest): Promise<IChatResponse> {
		const startTime = Date.now();
		const requestBody = await this.parseAndValidateRequest(request);
		const { message, userId, conversationId, conversationHistory } = requestBody;

		const messageHash = this.hashMessage(message, userId);
		await this.handleRequestDedup(userId, messageHash);

		let finalConversationId: string | undefined;
		let isNewConversation = false;

		try {
			const { activeConversationId, isNewConversation: validatedIsNewConversation } = await this.validateConversation(conversationId, userId);
			finalConversationId = activeConversationId;
			isNewConversation = validatedIsNewConversation;

			const finalHistory = await this.prepareConversationHistory(activeConversationId || undefined, conversationHistory);

			const apiResponse = await this.callExternalAPIWithCleanup(message, userId, finalHistory, messageHash);
			const { text: aiResponseText, sources, followUpQuestions, remainingRequests } = apiResponse;
			const followUpLogic = shouldShowFollowUps(aiResponseText, followUpQuestions || []);

			let finalResponseText = aiResponseText;
			if (remainingRequests !== undefined && remainingRequests < 999 && remainingRequests < 5) {
				finalResponseText += `\n\n⚠️ **Warning**: You are approaching the usage limit. You have ${remainingRequests} requests remaining this minute.`;
			}

			if (isNewConversation) {
				finalConversationId = await KlaraDatabaseService.CreateConversation(userId);
			}

			const { userMessage, aiMessage } = this.createMessages(message, finalResponseText, finalConversationId, sources, followUpLogic.filtered);
			await KlaraDatabaseService.SaveMessagesToConversation(finalConversationId, [userMessage, aiMessage], userId);

			ensureTableExists()
				.then(() =>
					logQueryResponse({
						query: message,
						response: finalResponseText,
						status: 'success',
						userId: userId.toString(),
						conversationId: finalConversationId,
						responseTimeMs: Date.now() - startTime
					})
				)
				.catch((error) => console.warn('PostgreSQL logging failed:', error));

			return {
				text: finalResponseText,
				sources,
				followUpQuestions: followUpLogic.filtered,
				isNewConversation,
				conversationId: isNewConversation ? finalConversationId : undefined
			};
		} finally {
			await this.cleanup(finalConversationId, userId, messageHash);
		}
	}
}
