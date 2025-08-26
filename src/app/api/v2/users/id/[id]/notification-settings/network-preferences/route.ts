// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENetwork, IUserNotificationSettings, IUserNotificationTriggerPreferences } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

const zodNetworkPreferencesSchema = z.object({
	networks: z.array(z.nativeEnum(ENetwork)),
	preferences: z.object({
		gov1: z
			.object({
				referendums: z
					.object({
						enabled: z.boolean(),
						newReferendumSubmitted: z.boolean().optional(),
						referendumVoting: z.boolean().optional(),
						referendumClosed: z.boolean().optional()
					})
					.optional(),
				councilMotions: z
					.object({
						enabled: z.boolean(),
						newMotionsSubmitted: z.boolean().optional(),
						motionInVoting: z.boolean().optional(),
						motionClosed: z.boolean().optional()
					})
					.optional(),
				proposals: z
					.object({
						enabled: z.boolean(),
						newProposalSubmitted: z.boolean().optional(),
						proposalInVoting: z.boolean().optional(),
						proposalClosed: z.boolean().optional()
					})
					.optional(),
				treasuryProposals: z
					.object({
						enabled: z.boolean(),
						newProposalSubmitted: z.boolean().optional(),
						proposalInVoting: z.boolean().optional(),
						proposalClosed: z.boolean().optional()
					})
					.optional(),
				bounties: z
					.object({
						enabled: z.boolean(),
						bountiesSubmitted: z.boolean().optional(),
						bountiesClosed: z.boolean().optional()
					})
					.optional(),
				childBounties: z
					.object({
						enabled: z.boolean(),
						childBountiesSubmitted: z.boolean().optional(),
						childBountiesClosed: z.boolean().optional()
					})
					.optional(),
				tips: z
					.object({
						enabled: z.boolean(),
						newTipsSubmitted: z.boolean().optional(),
						tipsOpened: z.boolean().optional(),
						tipsClosed: z.boolean().optional()
					})
					.optional(),
				techCommittee: z
					.object({
						enabled: z.boolean(),
						newProposalsSubmitted: z.boolean().optional(),
						proposalsClosed: z.boolean().optional()
					})
					.optional()
			})
			.optional(),

		openGov: z
			.object({
				tracks: z.record(
					z.object({
						enabled: z.boolean(),
						newReferendumSubmitted: z.boolean().optional(),
						referendumInVoting: z.boolean().optional(),
						referendumClosed: z.boolean().optional()
					})
				)
			})
			.optional(),

		myProposals: z
			.object({
				enabled: z.boolean(),
				commentsOnMyPosts: z.boolean().optional(),
				ownProposalCreated: z.boolean().optional(),
				mentions: z.boolean().optional()
			})
			.optional(),

		subscribedPosts: z
			.object({
				enabled: z.boolean(),
				commentsOnSubscribedPosts: z.boolean().optional()
			})
			.optional()
	})
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const networkPreferences = user.notificationPreferences?.triggerPreferences || {};

	const structuredPreferences = Object.entries(networkPreferences).reduce(
		(acc, [network, prefs]) => {
			acc[network] = prefs;
			return acc;
		},
		{} as Record<string, Record<string, unknown>>
	);

	return NextResponse.json({
		networkPreferences: structuredPreferences,
		availableNetworks: Object.values(ENetwork)
	});
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { networks, preferences } = zodNetworkPreferencesSchema.parse(await getReqBody(req));

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const currentNotificationPreferences = user.notificationPreferences || {
		channelPreferences: {},
		triggerPreferences: {}
	};

	const triggerPreferences: { [network: string]: { [index: string]: IUserNotificationTriggerPreferences } } = {};

	networks.forEach((network) => {
		const networkTriggers: { [index: string]: IUserNotificationTriggerPreferences } = {};

		if (preferences.gov1) {
			Object.entries(preferences.gov1).forEach(([category, settings]) => {
				if (settings && typeof settings === 'object' && 'enabled' in settings) {
					const baseKey = `gov1_${category}`;
					networkTriggers[baseKey] = {
						name: baseKey,
						enabled: settings.enabled
					};
				}
			});
		}

		if (preferences.openGov?.tracks) {
			Object.entries(preferences.openGov.tracks).forEach(([track, settings]) => {
				const trackKey = `openGov_${track}`;
				networkTriggers[trackKey] = {
					name: trackKey,
					enabled: settings.enabled,
					tracks: [track]
				};
			});
		}

		if (preferences.myProposals) {
			networkTriggers.myProposals = {
				name: 'myProposals',
				enabled: preferences.myProposals.enabled
			};
		}

		if (preferences.subscribedPosts) {
			networkTriggers.subscribedPosts = {
				name: 'subscribedPosts',
				enabled: preferences.subscribedPosts.enabled
			};
		}

		triggerPreferences[network] = networkTriggers;
	});

	const updatedNotificationPreferences: IUserNotificationSettings = {
		...currentNotificationPreferences,
		triggerPreferences: {
			...currentNotificationPreferences.triggerPreferences,
			...triggerPreferences
		}
	};

	await OffChainDbService.UpdateUserProfile({
		userId: id,
		newProfileDetails: {},
		notificationPreferences: updatedNotificationPreferences
	});

	return NextResponse.json({
		message: 'Network notification preferences updated successfully',
		updatedNetworks: networks,
		triggerPreferences: updatedNotificationPreferences.triggerPreferences
	});
});
