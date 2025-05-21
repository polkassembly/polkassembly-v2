// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EOffChainPostTopic } from '../types';

export const searchEnabledNetworks = ['KUSAMA', 'POLKADOT', 'POLKADEX', 'CERE', 'MOONBEAM', 'MOONRIVER', 'MOONBASE'];

export const POST_TOPIC_MAP: Record<EOffChainPostTopic, number> = {
	[EOffChainPostTopic.AUCTION_ADMIN]: 8,
	[EOffChainPostTopic.COUNCIL]: 2,
	[EOffChainPostTopic.DEMOCRACY]: 1,
	[EOffChainPostTopic.FELLOWSHIP]: 10,
	[EOffChainPostTopic.GENERAL]: 5,
	[EOffChainPostTopic.GENERAL_ADMIN]: 15,
	[EOffChainPostTopic.GOVERNANCE]: 9,
	[EOffChainPostTopic.ROOT]: 6,
	[EOffChainPostTopic.STAKING_ADMIN]: 7,
	[EOffChainPostTopic.TREASURY]: 4,
	[EOffChainPostTopic.WHITELIST]: 11,
	[EOffChainPostTopic.TECHNICAL_COMMITTEE]: 3
};
