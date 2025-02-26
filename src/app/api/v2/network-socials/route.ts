// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FirestoreService } from '@/app/api/_api-services/offchain_db_service/firestore_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { AuthService } from '@api/_api-services/auth_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SET_COOKIE = 'Set-Cookie';

// GET endpoint to retrieve network socials
export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();

	// Validate if network exists
	try {
		const networkData = await FirestoreService.getNetworkSocials(network);
		if (!networkData) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Network not found');
		}

		// Extract blockchain_socials from network data
		const networkSocials = networkData.blockchain_socials || {};

		return NextResponse.json({ data: networkSocials });
	} catch (error) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : 'Error retrieving network socials');
	}
});

// POST endpoint to update network socials
export const POST = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// Validate request body
	const socialsSchema = z
		.object({
			discord: z.string().url().optional(),
			element: z.string().url().optional(),
			github: z.string().url().optional(),
			homepage: z.string().url().optional(),
			medium: z.string().url().optional(),
			telegram: z.string().url().optional(),
			twitter: z.string().url().optional(),
			youtube: z.string().url().optional()
		})
		.strict();

	const bodyRaw = await getReqBody(req);
	const socials = socialsSchema.parse(bodyRaw);

	try {
		// Check if network exists
		const networkData = await FirestoreService.getNetworkSocials(network);

		if (!networkData) {
			// Create a new network entry if it doesn't exist
			await FirestoreService.createNetworkSocials(network, {
				blockchain_socials: socials
			});
		} else {
			// Update existing network socials
			await FirestoreService.updateNetworkSocials(network, {
				blockchain_socials: socials
			});
		}

		const response = NextResponse.json({
			message: 'Network socials updated successfully',
			data: socials
		});

		response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
		response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

		return response;
	} catch (error) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : 'Error updating network socials');
	}
});

// DELETE endpoint to remove network socials
export const DELETE = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	try {
		// Check if network exists
		const networkData = await FirestoreService.getNetworkSocials(network);

		if (!networkData) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Network not found');
		}

		// Remove blockchain_socials field
		await FirestoreService.updateNetworkSocials(network, {
			blockchain_socials: undefined
		});

		const response = NextResponse.json({
			message: 'Network socials removed successfully'
		});

		response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
		response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

		return response;
	} catch (error) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : 'Error removing network socials');
	}
});
