// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ensureFeedbackTableExists, saveFeedback } from '@/app/api/_api-services/klara/postgres';

const feedbackBodySchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Please enter a valid email address'),
	company: z.string().optional(),
	feedbackText: z.string().optional(),
	userId: z.string().optional(),
	conversationId: z.string().optional(),
	messageId: z.string().optional(),
	rating: z.number().int().min(1).max(5).optional(),
	feedbackType: z.string().optional().default('form_submission'),
	queryText: z.string().optional(),
	responseText: z.string().optional()
});

export const POST = withErrorHandling(async (request: NextRequest) => {
	try {
		// Ensure feedback table exists
		await ensureFeedbackTableExists();

		const body = await request.json();
		const validatedData = feedbackBodySchema.parse(body);

		// Save feedback to database
		await saveFeedback({
			firstName: validatedData.firstName.trim(),
			lastName: validatedData.lastName.trim(),
			email: validatedData.email.trim().toLowerCase(),
			company: validatedData.company?.trim() || undefined,
			feedbackText: validatedData.feedbackText?.trim() || undefined,
			userId: validatedData.userId || undefined,
			conversationId: validatedData.conversationId || undefined,
			messageId: validatedData.messageId || undefined,
			rating: validatedData.rating || undefined,
			feedbackType: validatedData.feedbackType || 'form_submission',
			queryText: validatedData.queryText?.trim() || undefined,
			responseText: validatedData.responseText?.trim() || undefined
		});

		return NextResponse.json({
			success: true,
			message: 'Thank you for your feedback! We appreciate your input.'
		});
	} catch (error) {
		console.error('Feedback submission error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to submit feedback. Please try again later.'
			},
			{ status: 500 }
		);
	}
});
