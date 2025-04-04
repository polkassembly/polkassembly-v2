// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { TOOLS_PASSPHRASE } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

enum EIndexerEvent {
	PROPOSAL_CREATED = 'proposal_created'
}

const zodParamsSchema = z.object({
	indexerEvent: z.nativeEnum(EIndexerEvent)
});

const zodEventBodySchemas = {
	[EIndexerEvent.PROPOSAL_CREATED]: z.object({
		indexOrHash: z.string()
	})
} as const;

// Handle Indexer Events
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ indexerEvent: string }> }): Promise<NextResponse> => {
	const { indexerEvent } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const readonlyHeaders = await headers();
	const passphrase = readonlyHeaders.get('x-tools-passphrase');
	if (!passphrase?.trim() || passphrase !== TOOLS_PASSPHRASE) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const body = zodEventBodySchemas[indexerEvent as EIndexerEvent].parse(await getReqBody(req));

	return NextResponse.json({ message: `Indexer event ${indexerEvent} processed for network ${network} with params: ${JSON.stringify(body)} successfully` });
});
