// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { fetchWithTimeout } from '@/_shared/_utils/fetchWithTimeout';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { ENetwork, EProposalType, IOffChainPost } from '@/_shared/types';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// TODO: IMPLEMENT THIS
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

		const data = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

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
			// eslint-disable-next-line no-underscore-dangle
			id: data?._id || '',
			index: proposalType !== EProposalType.TIP ? Number(indexOrHash) : undefined,
			hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
			title: title || DEFAULT_POST_TITLE,
			content: content || getDefaultPostContent(proposalType, data?.proposer),
			createdAt: data?.createdAt ? new Date(data.createdAt) : undefined,
			updatedAt: data?.updatedAt ? new Date(data.updatedAt) : undefined,
			tags: [],
			proposalType,
			network
		};

		return offChainPost;
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
}
