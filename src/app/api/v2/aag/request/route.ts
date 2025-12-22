// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { APIError } from '@/app/api/_api-utils/apiError';
import { TelegramService } from '@/app/api/_api-services/external_api_service/telegram_service';

const zodPresentationRequestSchema = z.object({
	fullName: z.string().min(1, 'Full name is required'),
	organization: z.string().optional(),
	hasProposal: z.string().min(1, 'Has proposal field is required'),
	referendumIndex: z.string().optional(),
	description: z.string().min(1, 'Description is required'),
	estimatedDuration: z.string().optional(),
	preferredDate: z.string().optional(),
	email: z.string().email().optional(),
	telegram: z.string().optional(),
	twitter: z.string().optional()
});

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const formData = await req.formData();

	const formFields = {
		fullName: formData.get('fullName'),
		organization: formData.get('organization') ?? undefined,
		hasProposal: formData.get('hasProposal'),
		referendumIndex: formData.get('referendumIndex') ?? undefined,
		description: formData.get('description'),
		estimatedDuration: formData.get('estimatedDuration') ?? undefined,
		preferredDate: formData.get('preferredDate') ?? undefined,
		email: formData.get('email') ?? undefined,
		telegram: formData.get('telegram') ?? undefined,
		twitter: formData.get('twitter') ?? undefined
	};

	const validation = zodPresentationRequestSchema.safeParse(formFields);
	if (!validation.success) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, validation.error.errors[0]?.message || 'Invalid form data');
	}

	const presentationData = {
		...validation.data,
		supportingFile: formData.get('supportingFile') as File | null
	};

	await TelegramService.sendPresentationRequestWithFile(presentationData);

	return NextResponse.json({
		success: true,
		message: 'Presentation request submitted successfully'
	});
});
