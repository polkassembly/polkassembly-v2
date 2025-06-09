// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { fetchWithTimeout } from '@/_shared/_utils/fetchWithTimeout';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { EAllowedCommentor, EDataSource, ENetwork, EProposalType, ICommentResponse, IContentSummary, IOffChainPost, IPostOffChainMetrics } from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { htmlToMarkdown } from '@/_shared/_utils/htmlToMarkdown';
import dayjs from 'dayjs';
import { FirestoreService } from '../firestore_service';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

export class SubsquareOffChainService {
	private static GetBaseUrl = (network: ENetwork) => `https://${network}-api.subsquare.io`;

	private static postDetailsUrlMap = {
		[EProposalType.BOUNTY]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/treasury/bounties/${id}`,
		[EProposalType.CHILD_BOUNTY]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/treasury/child-bounties/${id}`,
		[EProposalType.COUNCIL_MOTION]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/motions/${id}`,
		[EProposalType.DEMOCRACY_PROPOSAL]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/democracy/proposals/${id}`,
		[EProposalType.FELLOWSHIP_REFERENDUM]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/fellowship/referenda/${id}`,
		[EProposalType.REFERENDUM]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/democracy/referendums/${id}`,
		[EProposalType.REFERENDUM_V2]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/gov2/referendums/${id}`,
		[EProposalType.TECH_COMMITTEE_PROPOSAL]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/tech-comm/motions/${id}`,
		[EProposalType.TIP]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/treasury/tips/${id}`,
		[EProposalType.TREASURY_PROPOSAL]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/treasury/proposals/${id}`,
		[EProposalType.DISCUSSION]: (id: string, network: ENetwork) => `${this.GetBaseUrl(network)}/posts/${id}`
	};

	static async GetOffChainPostData({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IOffChainPost | null> {
		const mappedUrl = this.postDetailsUrlMap[proposalType as keyof typeof this.postDetailsUrlMap]?.(indexOrHash, network);

		if (!mappedUrl) {
			return null;
		}

		try {
			const data = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

			const MIGRATION_DATE = dayjs('2025-06-08');

			if ((!data || data?.dataSource === EDataSource.POLKASSEMBLY) && proposalType !== EProposalType.BOUNTY && dayjs(data?.createdAt).isBefore(MIGRATION_DATE)) {
				return null;
			}

			let title = data?.title || '';

			if (title.includes('Untitled')) {
				title = '';
			}

			if (title && title.includes('[')) {
				title = title.replace(/\[[^\]]*\] Referendum #\d+: /, '');
			}

			let content = data?.content;

			let isDefaultContent = false;

			if (!content) {
				content = getDefaultPostContent(proposalType, data?.proposer);
				isDefaultContent = true;
			} else {
				content = data?.contentType === 'markdown' ? data.content : htmlToMarkdown(data.content);
			}

			if (!title && !content) {
				return null;
			}

			return {
				id: '',
				index: proposalType !== EProposalType.TIP ? Number(indexOrHash) : undefined,
				hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
				title: title || DEFAULT_POST_TITLE,
				content,
				createdAt: data?.createdAt ? new Date(data.createdAt) : undefined,
				updatedAt: data?.updatedAt ? new Date(data.updatedAt) : undefined,
				tags: [],
				proposalType,
				network,
				dataSource: EDataSource.SUBSQUARE,
				allowedCommentor: EAllowedCommentor.ALL,
				isDeleted: false,
				isDefaultContent
			};
		} catch {
			return null;
		}
	}

	// TODO: IMPLEMENT THIS (figure out page and limit)
	static async GetOffChainPostsListing({
		network,
		proposalType,
		limit,
		page
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
	}): Promise<IOffChainPost[]> {
		return [];
	}

	static async GetPostComments({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<ICommentResponse[]> {
		let mappedUrl = this.postDetailsUrlMap[proposalType as keyof typeof this.postDetailsUrlMap]?.(indexOrHash, network);

		if (!mappedUrl || proposalType === EProposalType.DISCUSSION) {
			return [];
		}

		mappedUrl = `${mappedUrl}/comments`;

		try {
			const allComments: any[] = [];
			const MAX_COMMENTS_PER_PAGE = 100;
			let page = 1;
			let hasMorePages = true;

			// Fetch comments page by page until we get an empty response
			while (hasMorePages) {
				const url = new URL(mappedUrl);
				url.searchParams.set('page', page.toString());
				url.searchParams.set('page_size', MAX_COMMENTS_PER_PAGE.toString());

				// eslint-disable-next-line no-await-in-loop
				const commentsData = await fetchWithTimeout(url).then((res) => res.json());

				if (!commentsData?.items?.length) {
					hasMorePages = false;
				} else {
					// Add all comments from this page to our collection
					allComments.push(...commentsData.items);
					page += 1;
				}
			}

			if (!allComments.length) {
				return [];
			}

			// Helper function to process a comment and its replies
			const processComment = async (comment: any): Promise<ICommentResponse> => {
				const publicUser = await FirestoreService.GetPublicUserByAddress(comment.author.address);

				const content = comment.contentType === 'markdown' ? comment.content : htmlToMarkdown(comment.content);

				// Convert comment author address to substrate format if needed
				const authorAddress = comment.author.address.startsWith('0x') ? comment.author.address : getSubstrateAddress(comment.author.address);

				// Combine and deduplicate addresses with authorAddress first
				const addresses = publicUser?.addresses ? [authorAddress, ...new Set(publicUser.addresses.filter((addr) => addr !== authorAddress))] : [authorAddress];

				return {
					// eslint-disable-next-line no-underscore-dangle
					id: comment._id,
					content,
					userId: publicUser?.id ?? 0,
					publicUser: publicUser
						? {
								...publicUser,
								addresses
							}
						: {
								addresses,
								id: -1,
								username: '',
								profileScore: 0,
								profileDetails: DEFAULT_PROFILE_DETAILS
							},
					createdAt: new Date(comment.createdAt),
					updatedAt: new Date(comment.updatedAt),
					isDeleted: false,
					network,
					proposalType,
					indexOrHash,
					parentCommentId: comment.replyToComment || null,
					children: [],
					dataSource: EDataSource.SUBSQUARE
				};
			};

			// Process all comments and their replies
			const processCommentsWithReplies = async (comments: any[]): Promise<any[]> => {
				const mainComments = await Promise.all(comments.map(processComment));
				const replies = await Promise.all(comments.filter((comment) => comment.replies?.length > 0).flatMap((comment) => processCommentsWithReplies(comment.replies)));

				return [...mainComments, ...replies.flat()];
			};

			return await processCommentsWithReplies(allComments);
		} catch {
			return [];
		}
	}

	static async GetPostMetrics({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IPostOffChainMetrics> {
		return {
			reactions: {
				like: 0,
				dislike: 0
			},
			comments: await this.GetPostComments({ network, indexOrHash, proposalType }).then((comments) => comments.length)
		};
	}

	static async GetContentSummary({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IContentSummary | null> {
		const mappedUrl = this.postDetailsUrlMap[proposalType as keyof typeof this.postDetailsUrlMap]?.(indexOrHash, network);

		if (!mappedUrl) {
			return null;
		}

		try {
			const data = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

			if (!data || !data?.contentSummary?.summary) {
				return null;
			}

			return {
				id: '',
				network,
				proposalType,
				indexOrHash,
				postSummary: data.contentSummary.summary,
				createdAt: data.contentSummary.postUpdatedAt ? new Date(data.contentSummary.postUpdatedAt) : new Date(),
				updatedAt: data.contentSummary.postUpdatedAt ? new Date(data.contentSummary.postUpdatedAt) : new Date()
			};
		} catch {
			return null;
		}
	}
}
