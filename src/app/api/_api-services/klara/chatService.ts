// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { IConversationMessage, IChatResponse, IConversationTurn } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { createId } from '@paralleldrive/cuid2';
import { KLARA_CONVERSATION_HISTORY_LIMIT } from '@/_shared/_constants/klaraConstants';
import { KlaraDatabaseService } from './database';
import { ExternalApiService } from './externalApiService';
import { validateRequestBody, shouldShowFollowUps, extractConversationHistory } from './utils/conversationUtils';
import { ensureTableExists, logQueryResponse } from './postgres';

export class ChatService {
	static async processMessage(request: NextRequest): Promise<IChatResponse> {
		const startTime = Date.now();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let requestBody: any;
		try {
			requestBody = await request.json();
		} catch {
			throw new APIError(ERROR_CODES.INVALID_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, 'Invalid JSON payload');
		}

		// Validate request
		const validation = validateRequestBody(requestBody);
		if (!validation.valid) {
			throw new APIError(ERROR_CODES.INVALID_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_REQUIRED_FIELDS);
		}

		const { message, userId, conversationId, conversationHistory } = requestBody;

		// 1. Validate existing conversation ownership (if provided) - quick check only
		let activeConversationId = conversationId;
		let isNewConversation = false;

		if (activeConversationId) {
			const owns = await KlaraDatabaseService.verifyConversationOwnership(activeConversationId, userId);
			if (!owns) {
				throw new APIError('FORBIDDEN', StatusCodes.FORBIDDEN, 'Unauthorized conversation access');
			}
		} else {
			// Don't create conversation yet - will create after API success
			isNewConversation = true;
		}

		// 2. Prepare conversation history (use client-provided or fetch from DB as fallback)
		const historyLimit = KLARA_CONVERSATION_HISTORY_LIMIT || 5;
		let finalHistory: IConversationTurn[] = [];

		if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
			// Use client-provided history (preferred - no DB call needed)
			finalHistory = conversationHistory.slice(-historyLimit);
		} else if (activeConversationId) {
			// Fallback: Fetch from DB (for backward compatibility with old clients)
			const conversationMessages = await KlaraDatabaseService.GetConversationMessages(activeConversationId);
			finalHistory = extractConversationHistory(conversationMessages, historyLimit);
		}

		// 3. CRITICAL PATH FIRST: Call external API before any DB writes
		let apiResponse;
		try {
			apiResponse = await ExternalApiService.callExternalAPI(message, userId, finalHistory);
		} catch (error) {
			// If API fails, don't create conversation or save anything
			// This prevents orphaned conversations and messages
			console.error('External API call failed:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get AI response. Please try again.');
		}

		const { text: aiResponseText, sources, followUpQuestions, remainingRequests } = apiResponse;
		const followUpLogic = shouldShowFollowUps(aiResponseText, followUpQuestions || []);

		// 4. Add rate limit warning if needed
		let finalResponseText = aiResponseText;
		if (remainingRequests !== undefined && remainingRequests < 999 && remainingRequests < 5) {
			finalResponseText += `\n\n⚠️ **Warning**: You are approaching the usage limit. You have ${remainingRequests} requests remaining this minute.`;
		}

		// 5. ONLY AFTER API SUCCESS: Create conversation (if new) and batch save messages
		if (isNewConversation) {
			// Create conversation now that we know API succeeded
			activeConversationId = await KlaraDatabaseService.CreateConversation(userId);
		}

		// Prepare messages
		const userMessage: IConversationMessage = {
			id: createId(),
			text: message,
			sender: 'user',
			conversationId: activeConversationId,
			timestamp: Date.now()
		};

		const aiMessage: IConversationMessage = {
			id: createId(),
			text: finalResponseText,
			sender: 'ai',
			conversationId: activeConversationId,
			timestamp: Date.now()
		};

		if (sources?.length) {
			aiMessage.sources = sources;
		}
		if (followUpLogic.filtered?.length) {
			aiMessage.followUpQuestions = followUpLogic.filtered;
		}

		// Batch save both messages atomically (more efficient than two separate calls)
		await KlaraDatabaseService.SaveMessagesToConversation(activeConversationId, [userMessage, aiMessage], userId);

		// 6. Fire-and-forget PostgreSQL logging (non-blocking)
		ensureTableExists()
			.then(() =>
				logQueryResponse({
					query: message,
					response: finalResponseText,
					status: 'success',
					userId: userId.toString(),
					conversationId: activeConversationId,
					responseTimeMs: Date.now() - startTime
				})
			)
			.catch((error) => console.warn('PostgreSQL logging failed:', error));

		return {
			text: finalResponseText,
			sources,
			followUpQuestions: followUpLogic.filtered,
			isNewConversation,
			conversationId: isNewConversation ? activeConversationId : undefined
		};
	}
}
