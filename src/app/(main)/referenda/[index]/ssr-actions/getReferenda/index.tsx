// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { request } from '@shared/_utils/request';
import { ENetwork } from '@shared/enum';
import { IDBPost, IPost } from '@shared/types';

const parseReferendum = (referendum: IDBPost) => ({
	id: referendum.id,
	title: referendum.title,
	content: referendum.content,
	hash: referendum.hash,
	proposer: referendum.proposer,
	postId: referendum.post_id
});

export const getReferenda = async (network: ENetwork, postId: number) => {
	// TODO:use network as a base to fetch referenda
	const { data, error } = await request(`/posts/on-chain-post?proposalType=referendums_v2&postId=${postId}`, {}, { method: 'POST' });
	if (error) {
		console.error(`Failed to fetch referenda for network ${network}:`, error);
		return null;
	}
	console.log(`Data for network ${network}:`, data);
	return parseReferendum(data) as IPost;
};
