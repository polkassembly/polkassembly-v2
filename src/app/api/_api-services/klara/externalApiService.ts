// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IChatApiResponse, IConversationTurn, IChatDataSource } from '@/_shared/types';
import { fetchWithTimeout } from './utils/requestUtils';

interface ApiResponse {
	text: string;
	sources?: IChatDataSource[];
	followUpQuestions?: string[];
	remainingRequests?: number;
}

export class ExternalApiService {
	private static getIntelligentFallbackResponse(message: string): ApiResponse {
		const messageKeywords = message.toLowerCase();
		let fallbackText = '';
		let fallbackSources: IChatDataSource[] = [];
		let fallbackQuestions: string[] = [];

		if (messageKeywords.includes('governance') || messageKeywords.includes('voting') || messageKeywords.includes('proposal') || messageKeywords.includes('referendum')) {
			fallbackText = `Thank you for asking about "${message}". Polkadot's governance system is a sophisticated democracy where token holders can propose and vote on network upgrades, treasury spending, and parameter changes.`;
			fallbackSources = [
				{
					title: 'Polkadot Governance Overview',
					url: 'https://wiki.polkadot.network/docs/learn-governance',
					source_type: 'polkadot_wiki',
					similarity_score: 0.9
				}
			];
			fallbackQuestions = ['How do I submit a proposal?', 'What are the different types of referenda?'];
		} else {
			fallbackText = `Thank you for your question: "${message}". I'm currently running with limited functionality while we resolve some connectivity issues.`;
			fallbackSources = [
				{
					title: 'Polkadot Wiki',
					url: 'https://wiki.polkadot.network/',
					source_type: 'polkadot_wiki',
					similarity_score: 0.75
				}
			];
			fallbackQuestions = ['What is Polkadot?', 'How does governance work?'];
		}

		return {
			text: fallbackText,
			sources: fallbackSources,
			followUpQuestions: fallbackQuestions,
			remainingRequests: 999
		};
	}

	static async callExternalAPI(message: string, userId: string, address: string, conversationHistory?: IConversationTurn[]): Promise<ApiResponse> {
		const apiUrl = process.env.KLARA_API_BASE_URL;
		const apiToken = process.env.KLARA_AI_TOKEN;

		if (!apiUrl || !apiToken || apiUrl.includes('example.com')) {
			return this.getIntelligentFallbackResponse(message);
		}

		try {
			const response = await fetchWithTimeout(apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiToken}`,
					'Content-Type': 'application/json',
					'User-Agent': 'Polkassembly-Klara/1.0',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					question: message.substring(0, 500),
					user_id: userId.toString(),
					client_ip: address || userId.toString(),
					max_chunks: 5,
					include_sources: true,
					conversation_history: conversationHistory || []
				}),
				timeout: 25000
			});

			if (!response.ok) {
				return this.getIntelligentFallbackResponse(message);
			}

			const data = (await response.json()) as IChatApiResponse;

			if (!data.answer) {
				return this.getIntelligentFallbackResponse(message);
			}

			return {
				text: data.answer,
				sources: data.sources || [],
				followUpQuestions: data.follow_up_questions || [],
				remainingRequests: data.remaining_requests || 0
			};
		} catch (error) {
			console.error('External API call failed:', error);
			return this.getIntelligentFallbackResponse(message);
		}
	}
}
