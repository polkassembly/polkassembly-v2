// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { EHttpHeaderKey } from '@/_shared/types';
import { TOOLS_PASSPHRASE } from '@/app/api/_api-constants/apiEnvVars';
import { WebhookService } from '@/app/api/_api-services/webhook_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes

// Handle Indexer Events
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ webhookEvent: string }> }): Promise<NextResponse> => {
	const { webhookEvent = '' } = await params;

	const network = await getNetworkFromHeaders();

	const readonlyHeaders = await headers();
	const passphrase = readonlyHeaders.get(EHttpHeaderKey.TOOLS_PASSPHRASE);
	if (!passphrase?.trim() || passphrase !== TOOLS_PASSPHRASE) {
		console.error('Unauthorized. received passphrase: ', passphrase);
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized.');
	}

	const body = await getReqBody(req);

	console.log('Webhook event received: ', { webhookEvent, network, body });

	await WebhookService.handleIncomingEvent({ event: webhookEvent, body, network });

	return NextResponse.json({ message: `Webhook event ${webhookEvent} processed successfully.`, params: { webhookEvent, network, body } });
});
