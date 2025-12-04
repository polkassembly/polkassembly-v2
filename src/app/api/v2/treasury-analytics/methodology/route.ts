// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { IMethodologyAppendix } from '@/_shared/types';

/**
 * GET /api/v2/analytics/methodology
 *
 * Returns the methodology appendix explaining how metrics are calculated including:
 * - Category definitions
 * - Segment definitions
 * - Valuation methodology
 * - Accounting assumptions
 * - Token conversion assumptions
 * - Chain coverage notes
 * - Exclusions and caveats
 */
export const GET = withErrorHandling(async (): Promise<NextResponse<IMethodologyAppendix>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// TODO: Implement actual methodology definitions
	// For now, return empty/placeholder data structure

	const response: IMethodologyAppendix = {
		categoryDefinitions: [],
		segmentDefinitions: [],
		valuationMethodology: '',
		accountingAssumptions: [],
		tokenConversionAssumptions: [],
		chainCoverageNotes: [],
		exclusionsAndCaveats: [],
		lastUpdated: new Date().toISOString()
	};

	return NextResponse.json(response);
});
