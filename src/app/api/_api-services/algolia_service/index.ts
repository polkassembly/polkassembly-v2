// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EPostOrigin, EProposalType, IAlgoliaPost } from '@/_shared/types';
import { createHash } from 'crypto';

// TODO: Implement Algolia Service
export class AlgoliaService {
	static hashTitleAndContent(title: string, content: string): string {
		const input = `${title}||${content}`;
		return createHash('sha256').update(input, 'utf8').digest('hex');
	}

	static async createPreliminaryAlgoliaPostRecord({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		const newAlgoliaPost: IAlgoliaPost = {
			objectID: `${network}-${proposalType}-${indexOrHash}`,
			title: '',
			createdAtTimestamp: new Date().getTime(),
			updatedAtTimestamp: new Date().getTime(),
			tags: [],
			dataSource: EDataSource.POLKASSEMBLY,
			proposalType,
			network,
			topic: '',
			lastCommentAtTimestamp: new Date().getTime(),
			userId: 0,
			hash: '',
			index: 0,
			parsedContent: '',
			titleAndContentHash: '',
			proposer: '',
			origin: EPostOrigin.BIG_SPENDER
		};

		console.log({ newAlgoliaPost });
	}
}
