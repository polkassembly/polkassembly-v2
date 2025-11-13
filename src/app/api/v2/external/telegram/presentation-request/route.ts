// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../../../../_api-constants/apiEnvVars';
import { APIError } from '../../../../_api-utils/apiError';
import { TelegramService } from '../../../../_api-services/external_api_service/telegram_service';

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		const fullName = formData.get('fullName') as string;
		const organization = formData.get('organization') as string;
		const hasProposal = formData.get('hasProposal') as string;
		const referendumIndex = formData.get('referendumIndex') as string;
		const description = formData.get('description') as string;
		const estimatedDuration = formData.get('estimatedDuration') as string;
		const preferredDate = formData.get('preferredDate') as string;
		const email = formData.get('email') as string;
		const telegram = formData.get('telegram') as string;
		const twitter = formData.get('twitter') as string;
		const supportingFile = formData.get('supportingFile') as File | null;

		if (!fullName?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Full name is required');
		}

		if (!description?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Description is required');
		}

		const contactInfo = [
			email ? `📧 <b>Email:</b> ${TelegramService.escapeHtml(email)}` : '',
			telegram ? `💬 <b>Telegram:</b> @${TelegramService.escapeHtml(telegram)}` : '',
			twitter ? `🐦 <b>Twitter:</b> @${TelegramService.escapeHtml(twitter)}` : ''
		]
			.filter(Boolean)
			.join('\n');

		const caption = [
			'🎤 <b>New Presentation Request</b>',
			'',
			`👤 <b>Name:</b> ${TelegramService.escapeHtml(fullName)}`,
			organization ? `🏢 <b>Organization:</b> ${TelegramService.escapeHtml(organization)}` : '',
			'',
			`📋 <b>Proposal Status:</b> ${hasProposal === 'yes' ? 'Yes ✅' : 'No ❌'}`,
			referendumIndex ? `🔗 <b>Referendum Index:</b> ${TelegramService.escapeHtml(referendumIndex)}` : '',
			'',
			'📝 <b>Description:</b>',
			`${TelegramService.escapeHtml(description)}`,
			'',
			`⏱️ <b>Duration:</b> ${TelegramService.escapeHtml(estimatedDuration || 'Not specified')}`,
			`📅 <b>Preferred Date:</b> ${preferredDate || 'Not specified'}`,
			'',
			contactInfo ? '📞 <b>Contact Information:</b>' : '',
			contactInfo
		]
			.filter(Boolean)
			.join('\n');

		if (supportingFile && supportingFile.size > 0) {
			const telegramFormData = new FormData();
			telegramFormData.append('chat_id', TELEGRAM_CHAT_ID!);
			telegramFormData.append('document', supportingFile);
			telegramFormData.append('caption', caption);
			telegramFormData.append('parse_mode', 'HTML');

			const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
				method: 'POST',
				body: telegramFormData
			});

			const responseData = await telegramResponse.json();

			if (!telegramResponse.ok || !responseData.ok) {
				console.error('Telegram API Error:', responseData);
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, telegramResponse.status, `Telegram error: ${responseData.description}`);
			}
		} else {
			const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: TELEGRAM_CHAT_ID,
					text: caption,
					parse_mode: 'HTML'
				})
			});

			const responseData = await telegramResponse.json();

			if (!telegramResponse.ok || !responseData.ok) {
				console.error('Telegram API Error:', responseData);
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, telegramResponse.status, `Telegram error: ${responseData.description}`);
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Presentation request submitted successfully'
		});
	} catch (error) {
		console.error('Error processing presentation request:', error);

		if (error instanceof APIError) {
			return NextResponse.json(
				{
					success: false,
					error: error.message
				},
				{ status: error.status }
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: 'Internal server error'
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
