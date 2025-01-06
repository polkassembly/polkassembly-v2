// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { fetchWithTimeout } from '@/_shared/_utils/fetchWithTimeout';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { EDataSource, ENetwork, EProposalType, ICommentResponse, IOffChainPost } from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { convertMarkdownToBlocksServer } from '@/app/api/_api-utils/convertMarkdownToBlocksServer';
import { convertHtmlToBlocksServer } from '@/app/api/_api-utils/convertHtmlToBlocksServer';
import { FirestoreService } from '../firestore_service';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

export class SubsquareOffChainService {
	private static postDetailsUrlMap = {
		[EProposalType.BOUNTY]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/bounties/${id}`,
		[EProposalType.CHILD_BOUNTY]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}`,
		[EProposalType.COUNCIL_MOTION]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/motions/${id}`,
		[EProposalType.DEMOCRACY_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/democracy/proposals/${id}`,
		[EProposalType.FELLOWSHIP_REFERENDUM]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}`,
		[EProposalType.REFERENDUM]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/democracy/referendums/${id}`,
		[EProposalType.REFERENDUM_V2]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/gov2/referendums/${id}`,
		[EProposalType.TECH_COMMITTEE_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}`,
		[EProposalType.TIP]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/tips/${id}`,
		[EProposalType.TREASURY_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/proposals/${id}`
	};

	static async GetOffChainPostData({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IOffChainPost | null> {
		const mappedUrl = this.postDetailsUrlMap[proposalType as keyof typeof this.postDetailsUrlMap]?.(indexOrHash, network);

		if (!mappedUrl) {
			return null;
		}

		try {
			const data = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

			// TODO: ENABLE THIS
			// if (!data || data?.dataSource === EDataSource.POLKASSEMBLY) {
			// return null;
			// }

			if (!data) {
				return null;
			}

			let title = data?.title || '';

			if (title.includes('Untitled')) {
				title = '';
			}

			if (title && title.includes('[Root] Referendum #')) {
				title = title.replace(/\[Root\] Referendum #\d+: /, '');
			}

			const content = data?.content || '';

			if (!title && !content) {
				return null;
			}

			const offChainPost: IOffChainPost = {
				id: '',
				index: proposalType !== EProposalType.TIP ? Number(indexOrHash) : undefined,
				hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
				title: title || DEFAULT_POST_TITLE,
				content: content || getDefaultPostContent(proposalType, data?.proposer),
				createdAt: data?.createdAt ? new Date(data.createdAt) : undefined,
				updatedAt: data?.updatedAt ? new Date(data.updatedAt) : undefined,
				tags: [],
				proposalType,
				network,
				dataSource: EDataSource.SUBSQUARE
			};

			return offChainPost;
		} catch {
			return null;
		}
	}

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

		if (!mappedUrl) {
			return [];
		}

		mappedUrl = `${mappedUrl}/comments`;

		try {
			const commentsData = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

			if (!commentsData?.items?.length) {
				return [];
			}

			// Helper function to process a comment and its replies
			const processComment = async (comment: any): Promise<any> => {
				const publicUser = await FirestoreService.GetPublicUserByAddress(comment.author.address);

				const content = comment.contentType === 'markdown' ? convertMarkdownToBlocksServer(comment.content) : convertHtmlToBlocksServer(comment.content);

				return {
					// eslint-disable-next-line no-underscore-dangle
					id: comment._id,
					content,
					userId: publicUser?.id ?? 0,
					user: publicUser ?? {
						addresses: [comment.author.address.startsWith('0x') ? comment.author.address : getSubstrateAddress(comment.author.address)],
						id: 0,
						username: '',
						profileScore: 0
					},
					createdAt: new Date(comment.createdAt),
					updatedAt: new Date(comment.updatedAt),
					isDeleted: false,
					network,
					proposalType,
					indexOrHash,
					parentCommentId: comment.replyToComment || null,
					address: comment.author.address,
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

			return await processCommentsWithReplies(commentsData.items);
		} catch {
			return [];
		}
	}
}
