// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EProposalType, IAlgoliaPost, IPost } from '@/_shared/types';
import { createHash } from 'crypto';
import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { algoliasearch } from 'algoliasearch';
import dayjs from 'dayjs';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { ALGOLIA_WRITE_API_KEY } from '../../_api-constants/apiEnvVars';
import { fetchPostData } from '../../_api-utils/fetchPostData';

const { NEXT_PUBLIC_ALGOLIA_APP_ID } = getSharedEnvVars();

export class AlgoliaService {
	// Maximum size for Algolia records in bytes (100KB)
	private static ALGOLIA_MAX_RECORD_SIZE = 100000;

	// Interface for initializing Algolia client
	private static initAlgoliaApi() {
		if (!NEXT_PUBLIC_ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			console.error('Algolia environment variables not set');
			throw new Error('Algolia environment variables not set');
		}

		try {
			return algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		} catch (error) {
			console.error('Error initializing Algolia client:', error);
			throw error;
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

	static async createPreliminaryAlgoliaPostRecord({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		try {
			// Initialize Algolia client
			const client = this.initAlgoliaApi();

			// Fetch post data from the API
			let postData: IPost;
			try {
				postData = await fetchPostData({ network, proposalType, indexOrHash });
			} catch (error) {
				console.error(`Failed to fetch post data for ${proposalType}/${indexOrHash} on ${network}:`, error);
				return;
			}

			// Parse content to plain text
			const parsedContent = markdownToPlainText(postData.content || '');

			// Extract tags
			const tags = postData.tags ? postData.tags.map((tag: string | { value: string }) => (typeof tag === 'string' ? tag : tag.value)) : [];

			// Get proposer and origin from onChainInfo
			const proposer = postData.onChainInfo?.proposer || '';
			const origin = postData.onChainInfo?.origin || '';

			// Determine the correct index and hash
			const index = proposalType !== EProposalType.TIP ? Number(indexOrHash) : undefined;
			const hash = proposalType === EProposalType.TIP ? indexOrHash : undefined;

			// Create the Algolia post object
			const algoliaPost: IAlgoliaPost = {
				objectID: `${network}-${proposalType}-${indexOrHash}`,
				title: postData.title || DEFAULT_POST_TITLE,
				createdAtTimestamp: postData.createdAt ? dayjs(postData.createdAt).unix() : dayjs().unix(),
				updatedAtTimestamp: postData.updatedAt ? dayjs(postData.updatedAt).unix() : dayjs().unix(),
				tags,
				dataSource: postData.dataSource || EDataSource.POLKASSEMBLY,
				proposalType,
				network,
				topic: typeof origin === 'string' ? origin : '',
				lastCommentAtTimestamp: postData.lastCommentAt ? dayjs(postData.lastCommentAt).unix() : dayjs().unix(),
				userId: postData.userId || postData.publicUser?.id || 0,
				...(hash && { hash }),
				...(index && { index }),
				parsedContent,
				titleAndContentHash: this.hashTitleAndContent(postData.title || DEFAULT_POST_TITLE, postData.content || ''),
				...(proposer && { proposer }),
				...(origin && { origin })
			};

			// Truncate content if the object is too large for Algolia
			const truncatedPost = this.truncateContentToFitLimit(algoliaPost);

			// Save to Algolia
			await client.saveObject({
				indexName: 'polkassembly_v2_posts',
				body: truncatedPost
			});

			console.log(`Successfully created preliminary Algolia record for ${proposalType}/${indexOrHash} on ${network}`);
		} catch (error) {
			console.error(`Error creating preliminary Algolia record for ${proposalType}/${indexOrHash} on ${network}:`, error);
			throw error;
		}
	}
}
