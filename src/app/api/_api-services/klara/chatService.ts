// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { IConversationMessage, IChatResponse } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { KlaraDatabaseService } from './database';
import { ExternalApiService } from './externalApiService';
import { validateRequestBody, shouldShowFollowUps, extractConversationHistory } from './utils/conversationUtils';
import { ensureTableExists, logQueryResponse } from './postgres';

export class ChatService {
	static async processMessage(request: NextRequest): Promise<IChatResponse> {
		const startTime = Date.now();
		const requestBody = await request.json();

		// Validate request
		const validation = validateRequestBody(requestBody);
		if (!validation.valid) {
			throw new APIError(ERROR_CODES.INVALID_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_REQUIRED_FIELDS);
		}

		const { message, userId, conversationId, address } = requestBody;

		// Create or use existing conversation
		let activeConversationId = conversationId;
		let isNewConversation = false;

		if (!activeConversationId) {
			activeConversationId = await KlaraDatabaseService.CreateConversation(userId);
			isNewConversation = true;
		}

		// Save user message
		const userMessage: IConversationMessage = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			text: message,
			sender: 'user',
			timestamp: Date.now()
		};
		await KlaraDatabaseService.SaveMessageToConversation(activeConversationId, userMessage);

		// Get conversation history
		const historyLimit = parseInt(process.env.KLARA_CONVERSATION_HISTORY_LIMIT || '5', 10);
		const conversationMessages = await KlaraDatabaseService.GetConversationMessages(activeConversationId);
		const conversationHistory = extractConversationHistory(conversationMessages, historyLimit);

		// Get AI response
		const { text: aiResponseText, sources, followUpQuestions, remainingRequests } = await ExternalApiService.callExternalAPI(message, userId, address, conversationHistory);

		const followUpLogic = shouldShowFollowUps(aiResponseText, followUpQuestions || []);

		// Add rate limit warning if needed
		let finalResponseText = aiResponseText;
		if (remainingRequests !== undefined && remainingRequests < 999 && remainingRequests < 5) {
			finalResponseText += `\n\n⚠️ **Warning**: You are approaching the usage limit. You have ${remainingRequests} requests remaining this minute.`;
		}

		// Create AI message
		const aiMessage: IConversationMessage = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			text: finalResponseText,
			sender: 'ai',
			timestamp: Date.now()
		};

		if (sources?.length) {
			aiMessage.sources = sources;
		}
		if (followUpLogic.filtered?.length) {
			aiMessage.followUpQuestions = followUpLogic.filtered;
		}

		await KlaraDatabaseService.SaveMessageToConversation(activeConversationId, aiMessage);

		try {
			await ensureTableExists();
			await logQueryResponse({
				query: message,
				response: finalResponseText,
				status: 'success',
				userId: userId.toString(),
				conversationId: activeConversationId,
				responseTimeMs: Date.now() - startTime
			});
		} catch (error) {
			console.warn('PostgreSQL logging failed:', error);
		}

		return {
			text: finalResponseText,
			sources,
			followUpQuestions: followUpLogic.filtered,
			isNewConversation,
			conversationId: isNewConversation ? activeConversationId : undefined
		};
	}
}
