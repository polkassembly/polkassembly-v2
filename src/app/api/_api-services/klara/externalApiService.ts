// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IChatApiResponse, IConversationTurn, IChatDataSource } from '@/_shared/types';
import { KLARA_API_BASE_URL, KLARA_AI_TOKEN } from '../../_api-constants/apiEnvVars';

interface ApiResponse {
	text: string;
	sources?: IChatDataSource[];
	followUpQuestions?: string[];
	remainingRequests?: number;
}

export class ExternalApiService {
	static async callExternalAPI(message: string, userId: string, conversationHistory?: IConversationTurn[]): Promise<ApiResponse> {
		const apiUrl = KLARA_API_BASE_URL;
		const apiToken = KLARA_AI_TOKEN;

		if (!apiUrl || !apiToken) {
			throw new Error('KLARA_API_BASE_URL or KLARA_AI_TOKEN is not configured');
		}

		const requestBody = {
			question: message.substring(0, 500),
			user_id: userId.toString(),
			client_ip: userId.toString(),
			max_chunks: 5,
			include_sources: true,
			conversation_history: conversationHistory || []
		};

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status} ${response.statusText || ''}`.trim());
		}

		const data: IChatApiResponse = await response.json();

		return {
			text: data.answer || '',
			sources: data.sources || [],
			followUpQuestions: data.follow_up_questions || [],
			remainingRequests: data.remaining_requests || 0
		};
	}
}
