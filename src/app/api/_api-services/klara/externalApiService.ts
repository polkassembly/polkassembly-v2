// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IChatApiResponse, IConversationTurn, IChatDataSource } from '@/_shared/types';
import { KLARA_API_BASE_URL, KLARA_AI_TOKEN } from '../../_api-constants/apiEnvVars';
import { fetchWithTimeout } from './utils/requestUtils';

interface ApiResponse {
	text: string;
	sources?: IChatDataSource[];
	followUpQuestions?: string[];
	remainingRequests?: number;
}

interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
	backoffMultiplier: number;
	retryableStatusCodes: number[];
}

interface RetryableError extends Error {
	isRetryable: boolean;
	statusCode?: number;
}

export class ExternalApiService {
	private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
		maxRetries: 3,
		baseDelay: 1000, // 1 second
		maxDelay: 10000, // 10 seconds
		backoffMultiplier: 2,
		retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Timeout, Rate Limit, Server Errors
	};

	private static async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	private static isRetryableError(error: unknown, statusCode?: number): boolean {
		// Network errors (fetch failures, timeouts, etc.)
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return true;
		}

		// AbortError (timeout)
		if (error instanceof Error && error.name === 'AbortError') {
			return true;
		}

		// HTTP status codes that are retryable
		if (statusCode && this.DEFAULT_RETRY_CONFIG.retryableStatusCodes.includes(statusCode)) {
			return true;
		}

		// Generic network errors
		if (error instanceof Error) {
			return (
				error.message.includes('network') ||
				error.message.includes('timeout') ||
				error.message.includes('ECONNRESET') ||
				error.message.includes('ENOTFOUND') ||
				error.message.includes('ECONNREFUSED')
			);
		}

		return false;
	}

	private static async makeApiRequest(
		apiUrl: string,
		apiToken: string,
		requestBody: Record<string, unknown>,
		timeout: number
	): Promise<{ response: Response; data: IChatApiResponse }> {
		const response = await fetchWithTimeout(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
				'User-Agent': 'Polkassembly-Klara/1.0',
				Accept: 'application/json'
			},
			body: JSON.stringify(requestBody),
			timeout
		});

		if (!response.ok) {
			const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as RetryableError;
			error.isRetryable = this.isRetryableError(error, response.status);
			error.statusCode = response.status;
			throw error;
		}

		const data = (await response.json()) as IChatApiResponse;

		if (!data.answer) {
			const error = new Error('No answer in response data') as RetryableError;
			error.isRetryable = false; // Don't retry if response format is wrong
			throw error;
		}

		return { response, data };
	}

	private static async callExternalAPIWithRetry(
		message: string,
		userId: string,
		conversationHistory?: IConversationTurn[],
		retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG
	): Promise<ApiResponse> {
		const apiUrl = KLARA_API_BASE_URL;
		const apiToken = KLARA_AI_TOKEN;

		if (!apiUrl || !apiToken || apiUrl === 'https://example.com' || apiUrl.startsWith('http://example.com')) {
			return this.getIntelligentFallbackResponse(message);
		}

		const requestBody = {
			question: message.substring(0, 500),
			user_id: userId.toString(),
			client_ip: userId.toString(),
			max_chunks: 5,
			include_sources: true,
			conversation_history: conversationHistory || []
		};

		return this.attemptApiCall(apiUrl, apiToken, requestBody, message, retryConfig, 0);
	}

	private static async attemptApiCall(
		apiUrl: string,
		apiToken: string,
		requestBody: Record<string, unknown>,
		message: string,
		retryConfig: RetryConfig,
		attemptNumber: number
	): Promise<ApiResponse> {
		try {
			console.log(`🔄 API call attempt ${attemptNumber + 1}/${retryConfig.maxRetries + 1}`);
			const { data } = await this.makeApiRequest(apiUrl, apiToken, requestBody, 25000);

			console.log(`✅ API call successful on attempt ${attemptNumber + 1}`);
			return {
				text: data.answer,
				sources: data.sources || [],
				followUpQuestions: data.follow_up_questions || [],
				remainingRequests: data.remaining_requests || 0
			};
		} catch (error) {
			const lastError = error as Error;
			const retryableError = error as RetryableError;

			console.log(`❌ API call failed on attempt ${attemptNumber + 1}:`, {
				error: lastError.message,
				isRetryable: retryableError.isRetryable,
				statusCode: retryableError.statusCode
			});

			// If not retryable or we've exhausted all retries, return fallback
			if (!retryableError.isRetryable || attemptNumber >= retryConfig.maxRetries) {
				console.error('🚨 All API retry attempts failed, using fallback response:', lastError);
				return this.getIntelligentFallbackResponse(message);
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(retryConfig.baseDelay * retryConfig.backoffMultiplier ** attemptNumber, retryConfig.maxDelay);

			console.log(`⏳ Waiting ${delay}ms before retry...`);
			await this.sleep(delay);

			// Recursively try again
			return this.attemptApiCall(apiUrl, apiToken, requestBody, message, retryConfig, attemptNumber + 1);
		}
	}

	private static getIntelligentFallbackResponse(message: string): ApiResponse {
		const messageKeywords = message.toLowerCase();
		let fallbackText = '';
		let fallbackSources: IChatDataSource[] = [];
		let fallbackQuestions: string[] = [];

		if (messageKeywords.includes('governance') || messageKeywords.includes('voting') || messageKeywords.includes('proposal') || messageKeywords.includes('referendum')) {
			fallbackText =
				"Polkadot's governance system is a sophisticated democracy where token holders can propose and vote on network upgrades, treasury spending, and parameter changes.";
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
			fallbackText = "I'm currently running with limited functionality while we resolve some connectivity issues.";
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

	static async callExternalAPI(message: string, userId: string, conversationHistory?: IConversationTurn[]): Promise<ApiResponse> {
		return this.callExternalAPIWithRetry(message, userId, conversationHistory);
	}
}
