// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENetwork, EProposalType, IPost, EDataSource, IPublicUser } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';
import { OffChainDbService } from '../_api-services/offchain_db_service';
import { OnChainDbService } from '../_api-services/onchain_db_service';
import { APIError } from './apiError';

async function getPublicUser({ proposer, userId }: { proposer?: string; userId?: number }) {
	let publicUser: IPublicUser | null = null;

	if (proposer && ValidatorService.isValidWeb3Address(proposer)) {
		publicUser = await OffChainDbService.GetPublicUserByAddress(proposer);
	}

	if (!publicUser && userId && ValidatorService.isValidUserId(Number(userId || -1))) {
		publicUser = await OffChainDbService.GetPublicUserById(userId);
	}

	return publicUser;
}

export async function fetchPostData({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IPost> {
	const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType: proposalType as EProposalType });

	let post: IPost;

	// if is off-chain post just return the offchain post data
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		if (!offChainPostData) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}
		post = offChainPostData;
	} else {
		// if is on-chain post
		const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType: proposalType as EProposalType });

		if (!onChainPostInfo) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		post = {
			...offChainPostData,
			dataSource: offChainPostData?.dataSource || EDataSource.POLKASSEMBLY,
			proposalType: proposalType as EProposalType,
			network: network as ENetwork,
			onChainInfo: onChainPostInfo
		};
	}

	const publicUser = await getPublicUser({ userId: post.userId, proposer: post.onChainInfo?.proposer });

	if (publicUser) {
		post = { ...post, publicUser };
	}

	return post;
}
