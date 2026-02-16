// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
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

interface IPresentationRequestData {
	fullName: string;
	organization?: string;
	hasProposal: string;
	referendumIndex?: string;
	description: string;
	estimatedDuration?: string;
	preferredDate?: string;
	email?: string;
	telegram?: string;
	twitter?: string;
	supportingFile?: File | null;
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

	private static MAX_FILE_SIZE = 10 * 1024 * 1024;

	private static ALLOWED_MIME_TYPES = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	];

	private static ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

	private static validateTelegramConfig(): void {
		if (!TELEGRAM_BOT_TOKEN?.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Telegram bot token is not configured');
		}

		if (!TELEGRAM_CHAT_ID?.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Telegram chat ID is not configured');
		}
	}

	private static escapeMarkdown(text: string): string {
		if (!text) return '';
		return text.replace(/([_*`[])/g, '\\$1');
	}

	public static escapeHtml(text: string): string {
		if (!text) return '';
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	private static formatPresentationRequestHtml(data: IPresentationRequestData): string {
		const contactInfo = [
			data.email ? `📧 <b>Email:</b> ${this.escapeHtml(data.email)}` : '',
			data.telegram ? `💬 <b>Telegram:</b> @${this.escapeHtml(data.telegram)}` : '',
			data.twitter ? `🐦 <b>Twitter:</b> @${this.escapeHtml(data.twitter)}` : ''
		]
			.filter(Boolean)
			.join('\n');

		return [
			'🎤 <b>New Presentation Request</b>',
			'',
			`👤 <b>Name:</b> ${this.escapeHtml(data.fullName)}`,
			data.organization ? `🏢 <b>Organization:</b> ${this.escapeHtml(data.organization)}` : '',
			'',
			`📋 <b>Proposal Status:</b> ${data.hasProposal === 'yes' ? 'Yes ✅' : 'No ❌'}`,
			data.referendumIndex ? `🔗 <b>Referendum Index:</b> ${this.escapeHtml(data.referendumIndex)}` : '',
			'',
			'📝 <b>Description:</b>',
			`${this.escapeHtml(data.description)}`,
			'',
			`⏱️ <b>Duration:</b> ${this.escapeHtml(data.estimatedDuration || 'Not specified yet')}`,
			`📅 <b>Preferred Date:</b> ${this.escapeHtml(data.preferredDate || 'Not specified yet')}`,
			'',
			contactInfo ? '📞 <b>Contact Information:</b>' : '',
			contactInfo
		]
			.filter(Boolean)
			.join('\n');
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
${escapedEmail ? `📧 Email: ${escapedEmail}` : ''}
${escapedTelegram ? `💬 Telegram: @${escapedTelegram}` : ''}
${escapedTwitter ? `🐦 Twitter: @${escapedTwitter}` : ''}

${data.supportingFile ? `📎 Supporting file: ${this.escapeMarkdown(data.supportingFile.name)} (${(data.supportingFile.size / 1024 / 1024).toFixed(2)}MB)` : ''}
		`
			.trim()
			.replace(/\n{3,}/g, '\n\n');
	}

	private static validatePresentationFile(file: File): void {
		if (file.size > this.MAX_FILE_SIZE) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'File size must be less than 10MB');
		}

		if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed');
		}

		const fileName = file.name.toLowerCase();
		const hasValidExtension = this.ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
		if (!hasValidExtension) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid file extension. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed');
		}
	}

	private static async sendTelegramDocument(file: File, caption: string, chatId?: string): Promise<ITelegramApiResponse> {
		this.validateTelegramConfig();

		const targetChatId = chatId || TELEGRAM_CHAT_ID;
		const url = `${this.TELEGRAM_API_BASE_URL}/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;

		try {
			const formData = new FormData();
			formData.append('chat_id', targetChatId!);
			formData.append('document', file);
			formData.append('caption', caption);
			formData.append('parse_mode', 'HTML');

			const response = await fetch(url, {
				method: 'POST',
				body: formData
			});

			const data: ITelegramApiResponse = await response.json();

			if (!response.ok || !data.ok) {
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `Telegram API error: ${data.description || ERROR_MESSAGES.API_FETCH_ERROR}`);
			}

			return data;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send document to Telegram');
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
					parse_mode: 'MarkdownV2'
				})
			});

			const data: ITelegramApiResponse = await response.json();

			if (!response.ok || !data.ok) {
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `Telegram API error: ${data.description || ERROR_MESSAGES.API_FETCH_ERROR}`);
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

	private static async sendTelegramHtmlMessage(message: string, chatId?: string): Promise<ITelegramApiResponse> {
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
					parse_mode: 'HTML'
				})
			});

			const data: ITelegramApiResponse = await response.json();

			if (!response.ok || !data.ok) {
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `Telegram API error: ${data.description || ERROR_MESSAGES.API_FETCH_ERROR}`);
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

	static async sendPresentationRequestWithFile(data: IPresentationRequestData): Promise<ITelegramApiResponse> {
		if (!data?.fullName?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Full name is required');
		}

		if (!data?.description?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Description is required');
		}

		if (data.email && !ValidatorService.isValidEmail(data.email)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid email format');
		}

		if (data.supportingFile && data.supportingFile.size > 0) {
			this.validatePresentationFile(data.supportingFile);
		}

		const caption = this.formatPresentationRequestHtml(data);

		if (data.supportingFile && data.supportingFile.size > 0) {
			return this.sendTelegramDocument(data.supportingFile, caption);
		}
		return this.sendTelegramHtmlMessage(caption);
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
