// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IConversationMessage, IConversationTurn } from '@/_shared/types';

/**
 * Extract conversation history from messages, optimized with reverse iteration.
 * Stops early when limit is reached, avoiding processing all messages.
 * @param messages - Array of conversation messages in chronological order
 * @param limit - Maximum number of conversation turns to return
 * @returns Array of conversation turns (query-response pairs)
 */
export function extractConversationHistory(messages: IConversationMessage[], limit: number): IConversationTurn[] {
	if (!messages || messages.length === 0 || limit <= 0) {
		return [];
	}

	const pairs: IConversationTurn[] = [];
	// Iterate backwards to get the most recent pairs first, stop when limit reached
	for (let i = messages.length - 1; i > 0 && pairs.length < limit; i -= 1) {
		if (messages[i].sender === 'ai' && messages[i - 1].sender === 'user') {
			pairs.unshift({
				query: messages[i - 1].text,
				response: messages[i].text,
				timestamp: new Date(messages[i - 1].timestamp).toISOString()
			});
		}
	}

	return pairs;
}

export function shouldShowFollowUps(aiResponseText: string, followUpQuestions: string[]): { show: boolean; filtered: string[] } {
	const isInsufficientAnswer =
		[
			"i don't know",
			"i'm not sure",
			"sorry, i couldn't find",
			"i don't have enough information",
			'unable to find',
			'no specific information',
			'limited functionality',
			'fallback'
		].some((phrase) => aiResponseText.toLowerCase().includes(phrase)) || aiResponseText.length < 100;

	const show = isInsufficientAnswer || Math.random() < 0.3; // 30% chance for good answers
	const filtered = show ? followUpQuestions || [] : [];
	return { show, filtered };
}

export function validateRequestBody(requestBody: { message: string; userId: string; conversationId?: string; conversationHistory?: IConversationTurn[] }) {
	if (!requestBody.message || !requestBody.userId) {
		return { valid: false, error: 'Message and username are required' };
	}

	if (requestBody.message.length > 500) {
		return { valid: false, error: 'Message too long (max 500 characters)' };
	}

	if (requestBody.userId.length > 100) {
		return { valid: false, error: 'Username too long (max 100 characters)' };
	}

	// Validate conversationHistory if provided
	if (requestBody.conversationHistory && !Array.isArray(requestBody.conversationHistory)) {
		return { valid: false, error: 'conversationHistory must be an array' };
	}

	return { valid: true };
}
