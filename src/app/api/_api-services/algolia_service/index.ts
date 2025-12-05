// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EProposalType, IAlgoliaPost, IPost } from '@/_shared/types';
import { createHash } from 'crypto';
import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { algoliasearch } from 'algoliasearch';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ALGOLIA_WRITE_API_KEY } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';
import { delay } from '../../_api-utils/delay';
import { fetchPostData } from '../../_api-utils/fetchPostData';

const { NEXT_PUBLIC_ALGOLIA_APP_ID } = getSharedEnvVars();

export class AlgoliaService {
	// Maximum size for Algolia records in bytes (100KB)
	private static ALGOLIA_MAX_RECORD_SIZE = 100000;

	// Interface for initializing Algolia client
	private static initAlgoliaApi() {
		if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			console.error('Algolia environment variables not set');
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Algolia environment variables not set');
		}

		try {
			return algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		} catch (error) {
			console.error('Error initializing Algolia client:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error initializing Algolia client');
		}
	}

	// Function to calculate the size of an object in bytes
	static getObjectSizeInBytes(obj: Record<string, unknown>): number {
		return new TextEncoder().encode(JSON.stringify(obj)).length;
	}

	// Function to truncate parsedContent to fit within Algolia size limits
	static truncateContentToFitLimit(post: IAlgoliaPost): IAlgoliaPost {
		let currentSize = this.getObjectSizeInBytes(post);

		if (currentSize <= this.ALGOLIA_MAX_RECORD_SIZE) {
			return post;
		}

		console.log(`Post ${post.objectID} size (${currentSize} bytes) exceeds Algolia limit. Truncating parsedContent...`);

		// Create a copy of the post to modify
		const truncatedPost = { ...post };

		// Start with the full parsedContent and gradually reduce it
		let content = truncatedPost.parsedContent;

		while (currentSize > this.ALGOLIA_MAX_RECORD_SIZE && content.length > 0) {
			// Reduce content by 10% each iteration, but at least by 100 characters
			const reductionAmount = Math.max(Math.floor(content.length * 0.1), 100);
			content = content.substring(0, content.length - reductionAmount);

			// Try to cut at word boundary if possible
			const lastSpaceIndex = content.lastIndexOf(' ');
			if (lastSpaceIndex > content.length * 0.8) {
				content = content.substring(0, lastSpaceIndex);
			}

			// Update the post with truncated content
			truncatedPost.parsedContent = content + (content.length < post.parsedContent.length ? '...' : '');
			currentSize = this.getObjectSizeInBytes(truncatedPost);
		}

		console.log(`Post ${post.objectID} truncated from ${post.parsedContent.length} to ${truncatedPost.parsedContent.length} characters. New size: ${currentSize} bytes`);

		return truncatedPost;
	}

	static hashTitleAndContent(title: string, content: string): string {
		const input = `${title}||${content}`;
		return createHash('sha256').update(input, 'utf8').digest('hex');
	}

	// Helper method to extract index/hash from post data
	private static getPostIdentifier(post: IPost): { indexOrHash: string; index?: number; hash?: string } | null {
		if (post.proposalType === EProposalType.TIP) {
			// Tips use hash as identifier
			const hash = post.onChainInfo?.hash || post.hash || '';
			return hash ? { indexOrHash: hash, hash } : null;
		}
		// Other proposal types use index
		const index = post.onChainInfo?.index !== undefined ? post.onChainInfo.index : post.index;
		return index !== undefined ? { indexOrHash: String(index), index } : null;
	}

	// Helper method to build Algolia post object from IPost data
	private static buildAlgoliaPost(post: IPost): IAlgoliaPost | null {
		// Validate required fields
		if (!post.proposalType || !post.network) {
			console.error('Missing required fields for Algolia: proposalType or network');
			return null;
		}

		// Parse content to plain text
		const parsedContent = markdownToPlainText(post.content || '');

		// Extract tags
		const tags = post.tags ? post.tags.map((tag: string | { value: string }) => (typeof tag === 'string' ? tag : tag.value)) : [];

		// Get proposer and origin from onChainInfo
		const proposer = post.onChainInfo?.proposer || '';
		const origin = post.onChainInfo?.origin || '';

		// Determine the correct index and hash
		const identifier = this.getPostIdentifier(post);
		if (!identifier) {
			console.error('Missing index or hash for Algolia post');
			return null;
		}
		const { indexOrHash, index, hash } = identifier;

		// Get timestamps - check post first, then onChainInfo for createdAt
		const createdAt = post.createdAt || post.onChainInfo?.createdAt;
		const createdAtTimestamp = createdAt ? dayjs(createdAt).unix() : dayjs().unix();
		const updatedAtTimestamp = post.updatedAt ? dayjs(post.updatedAt).unix() : dayjs().unix();

		// Create the Algolia post object
		const algoliaPost: IAlgoliaPost = {
			objectID: `${post.network}-${post.proposalType}-${indexOrHash}`,
			title: post.title || DEFAULT_POST_TITLE,
			createdAtTimestamp,
			updatedAtTimestamp,
			tags,
			dataSource: post.dataSource || EDataSource.POLKASSEMBLY,
			proposalType: post.proposalType,
			network: post.network,
			topic: typeof origin === 'string' ? origin : '',
			lastCommentAtTimestamp: post.lastCommentAt ? dayjs(post.lastCommentAt).unix() : dayjs().unix(),
			userId: post.userId || post.publicUser?.id || 0,
			...(hash && { hash }),
			...(ValidatorService.isValidNumber(index) && { index }),
			parsedContent,
			titleAndContentHash: this.hashTitleAndContent(post.title || DEFAULT_POST_TITLE, post.content || ''),
			...(proposer && { proposer }),
			...(origin && { origin })
		};

		return algoliaPost;
	}

	// Helper method to save post to Algolia
	private static async saveToAlgolia(algoliaPost: IAlgoliaPost): Promise<void> {
		const client = this.initAlgoliaApi();

		// Truncate content if the object is too large for Algolia
		const truncatedPost = this.truncateContentToFitLimit(algoliaPost);

		// Save to Algolia
		await client.saveObject({
			indexName: 'polkassembly_v2_posts',
			body: truncatedPost
		});
	}

	static async createPreliminaryAlgoliaPostRecord({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		const maxRetries = 5;
		const initialDelay = 5000; // 5 seconds between retries

		for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
			try {
				// Fetch post data from the API
				// eslint-disable-next-line no-await-in-loop
				const postData = await fetchPostData({ network, proposalType, indexOrHash });

				// Build the Algolia post object
				const algoliaPost = this.buildAlgoliaPost(postData);
				if (!algoliaPost) {
					console.error(`Failed to build Algolia post for ${proposalType}/${indexOrHash} on ${network}`);
					return;
				}

				// Save to Algolia
				// eslint-disable-next-line no-await-in-loop
				await this.saveToAlgolia(algoliaPost);

				console.log(`Successfully created preliminary Algolia record for ${proposalType}/${indexOrHash} on ${network}`);
				return;
			} catch (error) {
				const isLastAttempt = attempt === maxRetries;

				if (isLastAttempt) {
					console.error(`Failed to create Algolia record for ${proposalType}/${indexOrHash} on ${network} after ${maxRetries + 1} attempts:`, error);
					return; // Don't throw to prevent disrupting other operations
				}

				// Exponential backoff: 5s, 10s, 20s, 40s, 80s
				const backoffDelay = initialDelay * 2 ** attempt;
				console.log(`Attempt ${attempt + 1}/${maxRetries + 1} failed for Algolia record ${proposalType}/${indexOrHash}. Retrying in ${backoffDelay / 1000}s...`);
				// eslint-disable-next-line no-await-in-loop
				await delay(backoffDelay);
			}
		}
	}

	static async updatePostRecord(post: IPost) {
		try {
			// Build the Algolia post object
			const algoliaPost = this.buildAlgoliaPost(post);
			if (!algoliaPost) {
				console.error('Failed to build Algolia post for update');
				return;
			}

			// Save to Algolia
			await this.saveToAlgolia(algoliaPost);

			// Extract identifier for logging
			const identifier = this.getPostIdentifier(post);
			const indexOrHash = identifier?.indexOrHash || 'unknown';

			console.log(`Successfully updated Algolia record for ${post.proposalType}/${indexOrHash} on ${post.network}`);
		} catch (error) {
			console.error('Error updating Algolia record for post:', error);
			// Don't throw the error to prevent disrupting the main flow
		}
	}

	static async deletePostRecord({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }) {
		try {
			// Initialize Algolia client
			const client = this.initAlgoliaApi();

			const objectID = `${network}-${proposalType}-${indexOrHash}`;

			// Delete from Algolia
			await client.deleteObject({
				indexName: 'polkassembly_v2_posts',
				objectID
			});

			console.log(`Successfully deleted Algolia record: ${objectID}`);
		} catch (error) {
			console.error(`Error deleting Algolia record for ${proposalType}/${indexOrHash} on ${network}:`, error);
			// Don't throw the error to prevent disrupting the main flow
		}
	}
}
