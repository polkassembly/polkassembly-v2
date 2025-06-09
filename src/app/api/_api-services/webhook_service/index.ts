// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EHttpHeaderKey, ENetwork, EPostOrigin, EProposalType, ERole, EWallet, IUser } from '@/_shared/types';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { getBaseUrl } from '@/_shared/_utils/getBaseUrl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { ACTIVE_BOUNTY_STATUSES } from '@/_shared/_constants/activeBountyStatuses';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { TOOLS_PASSPHRASE } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';
import { RedisService } from '../redis_service';
import { OnChainDbService } from '../onchain_db_service';
import { OffChainDbService } from '../offchain_db_service';

if (!TOOLS_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'TOOLS_PASSPHRASE is not set');
}

// TODO: add hooks for user creation and settings update

enum EWebhookEvent {
	PROPOSAL_CREATED = 'proposal_created',
	PROPOSAL_ENDED = 'proposal_ended',
	VOTED = 'voted',
	BOUNTY_CLAIMED = 'bounty_claimed',
	DECISION_DEPOSIT_PLACED = 'decision_deposit_placed',
	REMOVED_VOTE = 'removed_vote',
	TIPPED = 'tipped',
	DELEGATED = 'delegated',
	UNDELEGATED = 'undelegated',
	PROPOSAL_STATUS_UPDATED = 'proposal_status_updated',
	CACHE_REFRESH = 'cache_refresh',
	USER_CREATED = 'user_created',
	ADDRESS_CREATED = 'address_created',
	CLEAR_CACHE = 'clear_cache'
}

enum ECacheRefreshType {
	OFF_CHAIN_POSTS = 'off_chain_posts',
	REFERENDA_V2 = 'referenda_v2',
	BOUNTY = 'bounty',
	LISTING = 'listing'
}

// TODO: add handling for on-chain reputation scores

export class WebhookService {
	private static readonly zodParamsSchema = z.object({
		webhookEvent: z.nativeEnum(EWebhookEvent)
	});

	private static readonly zodEventBodySchemas = {
		[EWebhookEvent.PROPOSAL_CREATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.PROPOSAL_ENDED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.VOTED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.BOUNTY_CLAIMED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.DECISION_DEPOSIT_PLACED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.REMOVED_VOTE]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.TIPPED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.DELEGATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH)
		}),
		[EWebhookEvent.UNDELEGATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH)
		}),
		[EWebhookEvent.PROPOSAL_STATUS_UPDATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.CACHE_REFRESH]: z.object({
			cacheRefreshType: z.nativeEnum(ECacheRefreshType)
		}),
		[EWebhookEvent.USER_CREATED]: z.object({
			id: z.number().refine((id) => ValidatorService.isValidUserId(id), ERROR_MESSAGES.INVALID_USER_ID),
			username: z.string().refine((username) => ValidatorService.isValidUsername(username), ERROR_MESSAGES.INVALID_USERNAME),
			email: z
				.string()
				.optional()
				.transform((e) => (e === '' ? undefined : e))
				.refine((email) => email === undefined || ValidatorService.isValidEmail(email), ERROR_MESSAGES.INVALID_EMAIL),
			address: z
				.string()
				.refine((address) => ValidatorService.isValidWeb3Address(address), ERROR_MESSAGES.INVALID_EVM_ADDRESS)
				.optional(),
			salt: z.string(),
			isWeb3Signup: z.boolean().optional(),
			password: z.string()
		}),
		[EWebhookEvent.ADDRESS_CREATED]: z.object({
			address: z.string().refine((address) => ValidatorService.isValidWeb3Address(address), ERROR_MESSAGES.INVALID_EVM_ADDRESS),
			default: z.boolean(),
			network: z.nativeEnum(ENetwork),
			userId: z.number().refine((userId) => ValidatorService.isValidUserId(userId), ERROR_MESSAGES.INVALID_USER_ID),
			wallet: z.string()
		}),
		[EWebhookEvent.CLEAR_CACHE]: z.object({})
	} as const;

	static async handleIncomingEvent({ event, body, network }: { event: string; body: unknown; network: ENetwork }) {
		const { webhookEvent } = this.zodParamsSchema.parse({ webhookEvent: event });
		const params = this.zodEventBodySchemas[webhookEvent as EWebhookEvent].parse(body);

		switch (webhookEvent) {
			case EWebhookEvent.PROPOSAL_CREATED:
			case EWebhookEvent.PROPOSAL_ENDED:
			case EWebhookEvent.BOUNTY_CLAIMED:
			case EWebhookEvent.DECISION_DEPOSIT_PLACED:
			case EWebhookEvent.PROPOSAL_STATUS_UPDATED:
				return this.handleProposalStatusChanged({
					network,
					params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_UPDATED]>
				});
			case EWebhookEvent.VOTED:
			case EWebhookEvent.REMOVED_VOTE:
			case EWebhookEvent.TIPPED:
			case EWebhookEvent.DELEGATED:
			case EWebhookEvent.UNDELEGATED:
				return this.handleOtherEvent({ network, params });
			case EWebhookEvent.CACHE_REFRESH:
				return this.handleCacheRefresh({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.CACHE_REFRESH]> });
			case EWebhookEvent.USER_CREATED:
				return this.handleUserCreated({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.USER_CREATED]> });
			case EWebhookEvent.ADDRESS_CREATED:
				return this.handleAddressCreated({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.ADDRESS_CREATED]> });
			case EWebhookEvent.CLEAR_CACHE:
				return this.handleClearCache();
			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Unsupported event: ${event}`);
		}
	}

	private static async handleClearCache() {
		try {
			console.log('Starting cache clear for all networks...');

			const networks = Object.values(ENetwork);
			console.log(`Clearing cache for networks: ${networks.join(', ')}`);

			// Use Promise.all to ensure all operations complete and throw on any failure
			await Promise.all(
				networks.map(async (network) => {
					try {
						console.log(`Clearing cache for network: ${network}`);
						await RedisService.DeleteAllCacheForNetwork(network);
						console.log(`Successfully cleared cache for network: ${network}`);
					} catch (error) {
						console.error(`Failed to clear cache for network ${network}:`, error);
						throw error; // Re-throw to fail the entire operation
					}
				})
			);

			console.log('Cache cleared successfully for all networks');
		} catch (error) {
			console.error('Failed to clear cache for some networks:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to clear cache completely');
		}
	}

	private static async handleProposalStatusChanged({
		network,
		params
	}: {
		network: ENetwork;
		params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_UPDATED]>;
	}) {
		// TODO: add origin and clear cache for origin page too
		const { indexOrHash, proposalType } = params;

		// Invalidate caches
		await Promise.all([
			RedisService.DeletePostData({ network, proposalType, indexOrHash }),
			RedisService.DeletePostsListing({ network, proposalType }),
			RedisService.DeleteActivityFeed({ network }),
			RedisService.DeleteAllSubscriptionFeedsForNetwork(network),
			RedisService.DeleteOverviewPageData({ network })
		]);

		// Refresh above caches
		const baseUrl = await getBaseUrl();
		const headers = { [EHttpHeaderKey.NETWORK]: network, [EHttpHeaderKey.SKIP_CACHE]: 'true' };

		const fetchUrls = [];
		// 1. fetch above post details page
		fetchUrls.push(`${baseUrl}/${proposalType}/${indexOrHash}`);
		// 2. fetch listing page for above post
		fetchUrls.push(`${baseUrl}/${proposalType}`);
		// 3. overview page
		fetchUrls.push(`${baseUrl.replace('/api/v2', '')}`);

		// Process URLs in batches to avoid overwhelming the server
		const batchSize = 5; // Process 5 URLs at a time
		const timeout = 30000; // Extend timeout to 30 seconds
		const maxRetries = 2; // Allow up to 2 retries for failed requests

		const processResults = await this.processBatchesWithRetries(fetchUrls, headers, batchSize, timeout, maxRetries);
		console.log(`Cache refresh completed. Success: ${processResults.successCount}, Failed: ${processResults.failCount}`);
	}

	// refreshes caches for common endpoints and active proposals
	private static async handleCacheRefresh({ network, params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.CACHE_REFRESH]> }) {
		const { cacheRefreshType } = params;
		try {
			console.log(`Starting ${cacheRefreshType} cache refresh for network: ${network}`);

			const baseUrl = await getBaseUrl();
			console.log(`Clearing cache with baseUrl: ${baseUrl}`);

			const headers = { [EHttpHeaderKey.NETWORK]: network, [EHttpHeaderKey.SKIP_CACHE]: 'true' };

			// 0. Prepare all URLs that need to be fetched
			let fetchUrls: string[] = [];

			switch (cacheRefreshType) {
				case ECacheRefreshType.OFF_CHAIN_POSTS:
					fetchUrls = await this.getOffChainPostsRefreshUrls({ network, baseUrl });
					break;
				case ECacheRefreshType.REFERENDA_V2:
					fetchUrls = await this.getReferendaV2RefreshUrls({ network, baseUrl });
					break;
				case ECacheRefreshType.BOUNTY:
					fetchUrls = await this.getBountyRefreshUrls({ network, baseUrl });
					break;
				case ECacheRefreshType.LISTING:
					fetchUrls = await this.getListingRefreshUrls({ network, baseUrl });
					break;
				default:
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Unsupported cache refresh type: ${cacheRefreshType}`);
			}

			// 3. Process URLs in batches to avoid overwhelming the server
			const batchSize = 5; // Process 5 URLs at a time
			const timeout = 30000; // Extend timeout to 30 seconds
			const maxRetries = 2; // Allow up to 2 retries for failed requests

			console.log(`Processing ${fetchUrls.length} URLs in batches of ${batchSize}`);

			const processResults = await this.processBatchesWithRetries(fetchUrls, headers, batchSize, timeout, maxRetries);
			console.log(`Cache refresh completed. Success: ${processResults.successCount}, Failed: ${processResults.failCount}`);
		} catch (error) {
			console.error(`Error refreshing cache for network ${network}:`, error);
		}
	}

	private static async getOffChainPostsRefreshUrls({ network, baseUrl }: { network: ENetwork; baseUrl: string }) {
		const fetchUrls: string[] = [];

		// 2. add all active off-chain posts details pages
		const offChainPosts = await OffChainDbService.GetOffChainPostsListing({
			network,
			proposalType: EProposalType.DISCUSSION,
			limit: DEFAULT_LISTING_LIMIT * 2, // only refresh cache regularly for posts that are on the first 2 pages & are active (created in the last OFF_CHAIN_POST_ACTIVE_DAYS)
			page: 1
		});

		// content-summary cache for posts
		const contentSummaryPromises: Promise<void>[] = [];

		offChainPosts.forEach((post) => {
			const indexOrHash = post.index ?? post.hash;
			if (indexOrHash) {
				const proposalUrl = `${baseUrl}/${post.proposalType}/${indexOrHash}`;

				// proposal detail page
				fetchUrls.push(proposalUrl);

				// content-summary cache for posts
				contentSummaryPromises.push(RedisService.DeleteContentSummary({ network, indexOrHash: String(indexOrHash), proposalType: post.proposalType }));
			}
		});

		await Promise.allSettled(contentSummaryPromises);

		return fetchUrls;
	}

	private static async getReferendaV2RefreshUrls({ network, baseUrl }: { network: ENetwork; baseUrl: string }) {
		const fetchUrls: string[] = [];

		// 1. Fetch and add active refV2 details pages
		const { items: activeRefV2Proposals } = await OnChainDbService.GetOnChainPostsListing({
			network,
			proposalType: EProposalType.REFERENDUM_V2,
			limit: 100,
			page: 1,
			statuses: ACTIVE_PROPOSAL_STATUSES
		});

		// content-summary cache for refV2
		const contentSummaryPromises: Promise<void>[] = [];

		activeRefV2Proposals.forEach((proposal) => {
			const indexOrHash = proposal.index ?? proposal.hash;
			const proposalUrl = `${baseUrl}/${EProposalType.REFERENDUM_V2}/${indexOrHash}`;

			fetchUrls.push(proposalUrl);

			// content-summary cache for refV2
			contentSummaryPromises.push(RedisService.DeleteContentSummary({ network, indexOrHash: String(indexOrHash), proposalType: EProposalType.REFERENDUM_V2 }));
		});

		await Promise.allSettled(contentSummaryPromises);
		return fetchUrls;
	}

	private static async getBountyRefreshUrls({ network, baseUrl }: { network: ENetwork; baseUrl: string }) {
		const fetchUrls: string[] = [];

		// 1. Fetch and add active bounty details pages
		const activeBountyPromises = OnChainDbService.GetOnChainPostsListing({
			network,
			proposalType: EProposalType.BOUNTY,
			limit: 100,
			page: 1,
			statuses: ACTIVE_BOUNTY_STATUSES
		});

		const activeChildBountyPromises = OnChainDbService.GetOnChainPostsListing({
			network,
			proposalType: EProposalType.CHILD_BOUNTY,
			limit: 100,
			page: 1,
			statuses: ACTIVE_BOUNTY_STATUSES
		});

		const [activeBounties, activeChildBounties] = await Promise.all([activeBountyPromises, activeChildBountyPromises]);

		// content-summary cache for bounty
		const contentSummaryPromises: Promise<void>[] = [];

		activeBounties.items.forEach((bounty) => {
			const indexOrHash = bounty.index;
			const proposalUrl = `${baseUrl}/${EProposalType.BOUNTY}/${indexOrHash}`;

			fetchUrls.push(proposalUrl);

			// content-summary cache for bounty
			contentSummaryPromises.push(RedisService.DeleteContentSummary({ network, indexOrHash: String(indexOrHash), proposalType: EProposalType.BOUNTY }));
		});

		activeChildBounties.items.forEach((bounty) => {
			const indexOrHash = bounty.index;
			const proposalUrl = `${baseUrl}/${EProposalType.CHILD_BOUNTY}/${indexOrHash}`;

			fetchUrls.push(proposalUrl);

			// content-summary cache for bounty
			contentSummaryPromises.push(RedisService.DeleteContentSummary({ network, indexOrHash: String(indexOrHash), proposalType: EProposalType.CHILD_BOUNTY }));
		});

		await Promise.allSettled(contentSummaryPromises);

		return fetchUrls;
	}

	private static async getListingRefreshUrls({ network, baseUrl }: { network: ENetwork; baseUrl: string }) {
		const fetchUrls: string[] = [];

		// Define listing types and their page counts
		const listingTypes = [
			{ type: EProposalType.REFERENDUM_V2, pages: 5 }, // listing page for /all
			{ type: EProposalType.DISCUSSION, pages: 2 },
			{ type: EProposalType.BOUNTY, pages: 3 },
			{ type: EProposalType.CHILD_BOUNTY, pages: 2 }
		];

		// Generate paginated URLs for each listing type
		listingTypes.forEach(({ type, pages }) => {
			for (let page = 1; page <= pages; page += 1) {
				fetchUrls.push(`${baseUrl}/${type}?page=${page}&limit=${DEFAULT_LISTING_LIMIT}`);
			}
		});

		// Add track listing pages for REFERENDUM_V2
		const trackOrigins = Object.keys(NETWORKS_DETAILS[network as ENetwork].trackDetails);
		trackOrigins.forEach((origin) => {
			for (let page = 1; page <= 3; page += 1) {
				fetchUrls.push(`${baseUrl}/${EProposalType.REFERENDUM_V2}?origin=${origin as EPostOrigin}&page=${page}&limit=${DEFAULT_LISTING_LIMIT}`);
			}
		});

		// Add treasury stats api
		fetchUrls.push(`${baseUrl}/meta/treasury-stats`);

		// Overview page refresh
		await RedisService.DeleteOverviewPageData({ network });

		// fetch overview page
		fetchUrls.push(`${baseUrl.replace('/api/v2', '')}`);

		return fetchUrls;
	}

	// Helper method to process batches with retries
	private static async processBatchesWithRetries(
		urls: string[],
		headers: Record<string, string>,
		batchSize: number,
		timeout: number,
		maxRetries: number
	): Promise<{ successCount: number; failCount: number }> {
		let successCount = 0;
		let failCount = 0;

		// Split URLs into batches
		const batches: string[][] = [];
		for (let i = 0; i < urls.length; i += batchSize) {
			batches.push(urls.slice(i, i + batchSize));
		}

		// Process each batch
		// eslint-disable-next-line no-plusplus
		for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
			const batchUrls = batches[Number(batchIndex)];
			console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

			// Create fetch promises for this batch
			const batchPromises = batchUrls.map((url) => this.fetchWithRetry(url, headers, timeout, maxRetries));

			// Wait for all requests in this batch to complete
			// eslint-disable-next-line no-await-in-loop
			const results = await Promise.allSettled(batchPromises);

			// Count successes and failures
			// eslint-disable-next-line no-plusplus
			for (let i = 0; i < results.length; i++) {
				const result = results[Number(i)];
				if (result.status === 'fulfilled' && result.value) {
					successCount += 1;
				} else {
					failCount += 1;
					console.warn(`Failed to refresh cache for ${batchUrls[Number(i)]} after retries.`);
				}
			}

			// Add a small delay between batches to reduce server load
			if (batchIndex < batches.length - 1) {
				// eslint-disable-next-line no-await-in-loop
				await this.delay(500);
			}
		}

		return { successCount, failCount };
	}

	// Helper method to wait for a specific time
	private static delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	// Helper method to fetch with retries
	private static async fetchWithRetry(url: string, headers: Record<string, string>, timeout: number, maxRetries: number): Promise<Response | null> {
		let currentRetry = 0;

		while (currentRetry <= maxRetries) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				try {
					// eslint-disable-next-line no-await-in-loop
					const response = await fetch(url, {
						headers,
						signal: controller.signal
					});

					clearTimeout(timeoutId);

					// If successful, return the response
					if (response.ok) {
						if (currentRetry > 0) {
							console.log(`Successfully refreshed cache for ${url} after ${currentRetry} retries.`);
						}
						return response;
					}

					throw new Error(`Request to ${url} failed with status ${response.status}`);
				} catch (fetchError) {
					if (fetchError instanceof Error && fetchError.name === 'AbortError') {
						throw new Error(`Request to ${url} timed out after ${timeout / 1000} seconds`);
					}
					throw fetchError;
				}
			} catch (error) {
				// If we've used all retries, give up
				if (currentRetry === maxRetries) {
					console.warn(`All retries failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
					return null;
				}

				// Otherwise, wait and retry
				currentRetry += 1;
				console.log(`Retry ${currentRetry}/${maxRetries} for ${url}`);

				// eslint-disable-next-line no-await-in-loop
				await this.delay(1000 * currentRetry); // Exponential backoff
			}
		}

		// Should never get here due to return in the catch block
		return null;
	}

	private static async handleUserCreated({ network, params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.USER_CREATED]> }) {
		const { id, username, email, salt, isWeb3Signup, address, password } = params;

		const newUser: IUser = {
			email: email || '',
			createdAt: new Date(),
			updatedAt: new Date(),
			isEmailVerified: false,
			id,
			password,
			profileDetails: DEFAULT_PROFILE_DETAILS,
			profileScore: 0,
			salt,
			username,
			isWeb3Signup: email ? false : isWeb3Signup || false,
			primaryNetwork: network,
			roles: [ERole.USER]
		};

		const existingUser = await OffChainDbService.GetUserById(newUser.id);
		if (existingUser) {
			console.log(`User already exists: ${newUser.id}`);
			return;
		}

		await OffChainDbService.AddNewUser(newUser);

		if (isWeb3Signup && address) {
			await OffChainDbService.AddNewAddress({
				address,
				isDefault: true,
				network,
				userId: id,
				wallet: EWallet.OTHER
			});
		}
	}

	private static async handleAddressCreated({ params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.ADDRESS_CREATED]> }) {
		const { address, default: isDefault, network: addressNetwork, userId, wallet } = params;

		const substrateAddress = getSubstrateAddress(address);

		if (!substrateAddress) {
			console.log(`Address is not a valid substrate address: ${address}`);
			return;
		}

		const existingAddress = await OffChainDbService.GetAddressDataByAddress(substrateAddress);

		if (existingAddress) {
			console.log(`Address already exists: ${address}`);
			return;
		}

		await OffChainDbService.AddNewAddress({
			address,
			isDefault,
			network: addressNetwork,
			userId,
			wallet: Object.values(EWallet).includes(wallet as EWallet) ? (wallet as EWallet) : EWallet.OTHER
		});
	}

	private static async handleOtherEvent({ network, params }: { network: ENetwork; params: unknown }) {
		console.log('TODO: add handling for event ', { network, params });
	}
}
