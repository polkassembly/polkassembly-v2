// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '../../../../_api-utils/apiError';
import { TelegramService } from '../../../../_api-services/external_api_service/telegram_service';

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		const presentationData = {
			fullName: formData.get('fullName') as string,
			organization: (formData.get('organization') as string) || undefined,
			hasProposal: formData.get('hasProposal') as string,
			referendumIndex: (formData.get('referendumIndex') as string) || undefined,
			description: formData.get('description') as string,
			estimatedDuration: (formData.get('estimatedDuration') as string) || undefined,
			preferredDate: (formData.get('preferredDate') as string) || undefined,
			email: (formData.get('email') as string) || undefined,
			telegram: (formData.get('telegram') as string) || undefined,
			twitter: (formData.get('twitter') as string) || undefined,
			supportingFile: formData.get('supportingFile') as File | null
		};

		await TelegramService.sendPresentationRequestWithFile(presentationData);

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
