// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { ExternalJobsService } from '@/app/api/_api-services/external_api_service/external_jobs_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { searchParams } = new URL(req.url);
	const page = Number(searchParams.get('page')) || 1;
	const limit = Number(searchParams.get('limit')) || 10;
	const sortBy = searchParams.get('sortBy') || 'createdAt';

	const data = await ExternalJobsService.getJobs({ page, limit, sortBy });
	return NextResponse.json(data);
});
