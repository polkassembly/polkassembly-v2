// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { algoliasearch } from 'algoliasearch';
import { ESearchType, IPublicUser } from '@/_shared/types';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

const MAX_SEARCH_LIMIT = 100;
const DEFAULT_SEARCH_LIMIT = 10;

/**
 * Sanitize user data to only include public fields
 * Removes sensitive information like email, password, salt, etc.
 * @param userHit - Raw Algolia user hit
 * @returns Sanitized user data matching IPublicUser interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeUserHit(userHit: any): IPublicUser {
	return {
		id: userHit.id,
		...(userHit.createdAt && { createdAt: userHit.createdAt }),
		username: userHit.username || '',
		profileScore: userHit.profileScore || 0,
		addresses: userHit.addresses || [],
		...(userHit.rank && { rank: userHit.rank }),
		profileDetails: userHit.profileDetails || {}
	};
}

// Initialize Algolia client
const { NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY } = getSharedEnvVars();

if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
	console.error('Algolia credentials are missing from environment variables');
}

const algoliaClient = algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY);

/**
 * GET /api/v2/search
 *
 * Search for posts, discussions, or users using Algolia
 *
 * Query Parameters:
 * - q (required): Search query string
 * - type (optional): Search type - 'posts', 'discussions', or 'users' (default: 'posts')
 * - page (optional): Page number for pagination (default: 1)
 * - limit (optional): Results per page, max 100 (default: 10)
 *
 * Headers:
 * - x-network: Network identifier (required for posts/discussions)
 *
 * Security:
 * - User search results are sanitized to IPublicUser format
 * - Sensitive fields (email, password, salt) are removed from response
 */
export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	// Validate query parameters
	const zodQuerySchema = z.object({
		q: z.string().min(1, 'Search query cannot be empty'),
		type: z.nativeEnum(ESearchType).optional().default(ESearchType.POSTS),
		page: z.coerce.number().min(1).optional().default(1),
		limit: z.coerce.number().min(1).max(MAX_SEARCH_LIMIT).optional().default(DEFAULT_SEARCH_LIMIT)
	});

	const { q: query, type, page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	// Get network from headers
	const network = await getNetworkFromHeaders();

	// Determine index and filters based on search type
	let indexName: string;
	let filters: string;

	switch (type) {
		case ESearchType.POSTS:
			indexName = 'polkassembly_v2_posts';
			filters = `network:${network} AND (NOT proposalType:DISCUSSION AND NOT proposalType:GRANTS)`;
			break;
		case ESearchType.DISCUSSIONS:
			indexName = 'polkassembly_v2_posts';
			filters = `network:${network} AND (proposalType:DISCUSSION OR proposalType:GRANTS)`;
			break;
		case ESearchType.USERS:
			indexName = 'polkassembly_v2_users';
			filters = ''; // Users are global, no network filter
			break;
		default:
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, `Invalid search type: ${type}`);
	}

	try {
		// Perform Algolia search using the searchSingleIndex method
		const searchResults = await algoliaClient.searchSingleIndex({
			indexName,
			searchParams: {
				query,
				filters,
				page: page - 1, // Algolia uses 0-based indexing
				hitsPerPage: limit
			}
		});

		// Sanitize user hits to remove sensitive information
		const sanitizedHits = type === ESearchType.USERS ? searchResults.hits.map(sanitizeUserHit) : searchResults.hits;

		// Format response
		const response = {
			query,
			type,
			network: type === ESearchType.USERS ? undefined : network,
			hits: sanitizedHits,
			totalHits: searchResults.nbHits,
			page,
			hitsPerPage: limit,
			nbPages: searchResults.nbPages,
			processingTimeMS: searchResults.processingTimeMS
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('Algolia search error:', error);
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
});
