// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from './next_api_client_service';

export class CommentClientService extends NextApiClientService {
	static async getCommentsOfPost({ proposalType, index }: { proposalType: EProposalType; index: string }) {
		return this.getCommentsOfPostApi({
			proposalType,
			index
		});
	}

	static async addCommentToPost({
		proposalType,
		index,
		content,
		parentCommentId
	}: {
		proposalType: EProposalType;
		index: string;
		content: Record<string, unknown>;
		parentCommentId?: string;
	}) {
		return this.addCommentToPostApi({
			proposalType,
			index,
			content,
			parentCommentId
		});
	}
}
