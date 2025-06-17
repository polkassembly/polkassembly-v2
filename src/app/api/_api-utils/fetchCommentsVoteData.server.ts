// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { ENetwork, EProposalType, ICommentResponse } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OffChainDbService } from '../_api-services/offchain_db_service';
import { OnChainDbService } from '../_api-services/onchain_db_service';

export async function fetchCommentsVoteData({
	comments,
	network,
	proposalType,
	index
}: {
	comments: ICommentResponse[];
	network: ENetwork;
	proposalType: EProposalType;
	index: string;
}) {
	// Fetch user addresses and vote data for each comment
	return Promise.all(
		comments.map(async (comment) => {
			let userAddresses = await OffChainDbService.GetAddressesForUserId(comment.userId);

			if (comment.publicUser.addresses.length > 0 && !userAddresses.some((address) => comment.publicUser.addresses.includes(address.address))) {
				userAddresses = [
					...userAddresses,
					{
						address: comment.publicUser.addresses[0],
						network,
						userId: comment.userId,
						default: true
					}
				];
			}

			const voteData = ValidatorService.isValidOnChainProposalType(proposalType)
				? await Promise.all(
						userAddresses.map(async (address) => {
							return OnChainDbService.GetPostVoteData({
								network,
								proposalType,
								indexOrHash: index,
								voterAddress: address.address,
								page: 1,
								limit: DEFAULT_LISTING_LIMIT
							});
						})
					)
				: [];

			return {
				...comment,
				voteData: voteData.map((vote) => vote.votes).flat()
			} as ICommentResponse;
		})
	);
}
