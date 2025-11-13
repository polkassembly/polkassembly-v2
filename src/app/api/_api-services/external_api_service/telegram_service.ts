// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { APIError } from '../../_api-utils/apiError';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../../_api-constants/apiEnvVars';

if (!TELEGRAM_BOT_TOKEN?.trim()) {
	console.warn('\n ⚠️  Warning: TELEGRAM_BOT_TOKEN is not set. Telegram notifications will not be sent.\n');
}

if (!TELEGRAM_CHAT_ID?.trim()) {
	console.warn('\n ⚠️  Warning: TELEGRAM_CHAT_ID is not set. Telegram notifications will not be sent.\n');
}

interface ITelegramMessageData {
	fullName: string;
	organization?: string;
	hasProposal: string;
	referendumIndex?: string;
	description: string;
	estimatedDuration?: string;
	preferredDate?: string;
	supportingFile?: {
		name: string;
		size: number;
		type: string;
	} | null;
	email?: string;
	telegram?: string;
	twitter?: string;
}

interface ITelegramApiResponse {
	ok: boolean;
	result?: {
		message_id: number;
		date: number;
		chat: {
			id: number;
			type: string;
		};
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			username?: string;
		};
		text: string;
	};
	error_code?: number;
	description?: string;
}

export class TelegramService {
	private static TELEGRAM_API_BASE_URL = 'https://api.telegram.org';

	private static escapeMarkdown(text: string): string {
		if (!text) return '';
		return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
	}

	public static escapeHtml(text: string): string {
		if (!text) return '';
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	private static formatPresentationRequestMessage(data: ITelegramMessageData): string {
		const escapedFullName = this.escapeMarkdown(data.fullName);
		const escapedOrganization = data.organization ? this.escapeMarkdown(data.organization) : '';
		const escapedDescription = this.escapeMarkdown(data.description);
		const escapedReferendumIndex = data.referendumIndex ? this.escapeMarkdown(data.referendumIndex) : '';
		const escapedDuration = data.estimatedDuration ? this.escapeMarkdown(data.estimatedDuration) : 'Not specified';
		const escapedDate = data.preferredDate ? this.escapeMarkdown(data.preferredDate) : 'Not specified';
		const escapedEmail = data.email ? this.escapeMarkdown(data.email) : '';
		const escapedTelegram = data.telegram ? this.escapeMarkdown(data.telegram) : '';
		const escapedTwitter = data.twitter ? this.escapeMarkdown(data.twitter) : '';

		return `
🎤 *New Presentation Request*

👤 *Name:* ${escapedFullName}
${escapedOrganization ? `🏢 *Organization:* ${escapedOrganization}` : ''}

📋 *Proposal Status:* ${data.hasProposal === 'yes' ? 'Yes ✅' : 'No ❌'}
${escapedReferendumIndex ? `🔗 *Referendum Index:* ${escapedReferendumIndex}` : ''}

📝 *Description:*
${escapedDescription}

⏱️ *Duration:* ${escapedDuration}
📅 *Preferred Date:* ${escapedDate}

📧 *Contact Information:*
${escapedEmail ? `Email: ${escapedEmail}` : ''}
${escapedTelegram ? `Telegram: ${escapedTelegram}` : ''}
${escapedTwitter ? `Twitter: ${escapedTwitter}` : ''}

${data.supportingFile ? `📎 Supporting file: ${this.escapeMarkdown(data.supportingFile.name)} (${(data.supportingFile.size / 1024 / 1024).toFixed(2)}MB)` : ''}
		`
			.trim()
			.replace(/\n{3,}/g, '\n\n');
	}

	private static validateTelegramConfig(): void {
		if (!TELEGRAM_BOT_TOKEN?.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Telegram bot token is not configured');
		}

		if (!TELEGRAM_CHAT_ID?.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Telegram chat ID is not configured');
		}
	}

	private static async sendTelegramMessage(message: string, chatId?: string): Promise<ITelegramApiResponse> {
		this.validateTelegramConfig();

		const targetChatId = chatId || TELEGRAM_CHAT_ID;
		const url = `${this.TELEGRAM_API_BASE_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: targetChatId,
					text: message,
					parse_mode: 'Markdown'
				})
			});

			const data: ITelegramApiResponse = await response.json();

			if (!response.ok || !data.ok) {
				console.error('Telegram API Error:', data);
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `Telegram API error: ${data.description || 'Unknown error'}`);
			}

			return data;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			console.error('Error sending Telegram message:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send message to Telegram');
		}
	}

	static async sendPresentationRequest(data: ITelegramMessageData): Promise<ITelegramApiResponse> {
		if (!data?.fullName?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Full name is required');
		}

		if (!data?.description?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Description is required');
		}

		if (data.email && !ValidatorService.isValidEmail(data.email)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid email format');
		}

		const message = this.formatPresentationRequestMessage(data);
		return this.sendTelegramMessage(message);
	}

	static async sendNotification(message: string, chatId?: string): Promise<ITelegramApiResponse> {
		if (!message?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Message is required');
		}

		return this.sendTelegramMessage(message, chatId);
	}

	static async testConnection(): Promise<boolean> {
		try {
			this.validateTelegramConfig();

			const url = `${this.TELEGRAM_API_BASE_URL}/bot${TELEGRAM_BOT_TOKEN}/getMe`;
			const response = await fetch(url);
			const data = await response.json();

			return response.ok && data.ok;
		} catch (error) {
			console.error('Telegram connection test failed:', error);
			return false;
		}
	}
}
