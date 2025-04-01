// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EDataSource, EDelegationStatus, ENetwork, ITrackDelegationDetails } from '@/_shared/types';
import { cryptoWaitReady, encodeAddress } from '@polkadot/util-crypto';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { BN } from '@polkadot/util';
import { dayjs } from '@/_shared/_utils/dayjsInit';

// get delegation status and active proposals for all tracks
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
	const [network] = await Promise.all([getNetworkFromHeaders(), cryptoWaitReady()]);

	const zodParamsSchema = z.object({
		address: z
			.string()
			.refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
			.transform((addr) => encodeAddress(addr, NETWORKS_DETAILS[network as ENetwork].ss58Format)),
		trackNum: z.coerce.number().refine((num) => ValidatorService.isValidTrackNumber({ trackNum: num, network }), 'Not a valid track number for the network')
	});

	const { address, trackNum } = zodParamsSchema.parse(await params);

	// get delegations for address
	const delegationsForTrack = await OnChainDbService.GetConvictionVoteDelegationsToAndFromAddress({ network, address, trackNum });

	// if user has delegated to someone then delegateAddress is the address they delegated to, else it is the address itself
	const delegateAddress = delegationsForTrack.find((delegation) => delegation.from === address)?.to || address;

	// fetch active proposals for the track
	const onChainPostsListingWithDelegateVotes = await OnChainDbService.GetActiveProposalListingsWithVoteForAddressByTrackId({
		network,
		trackId: trackNum,
		voterAddress: delegateAddress
	});

	const offChainDataPromises = onChainPostsListingWithDelegateVotes.items.map((postInfo) => {
		return OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: postInfo.index!.toString(),
			proposalType: postInfo.type,
			proposer: postInfo.proposer || ''
		});
	});

	const offChainListing = await Promise.all(offChainDataPromises);

	// Merge on-chain and off-chain data
	const posts = onChainPostsListingWithDelegateVotes.items.map((postInfo, index) => ({
		...offChainListing[Number(index)],
		dataSource: offChainListing[Number(index)]?.dataSource || EDataSource.POLKASSEMBLY,
		network,
		proposalType: postInfo.type,
		onChainInfo: postInfo
	}));

	const activeProposalListingWithDelegateVote = {
		items: posts,
		totalCount: posts.length
	};

	const { convictionVotingPeriodInBlocks } = NETWORKS_DETAILS[network as ENetwork];

	const receivedDelegations = delegationsForTrack
		.filter((delegation) => delegation.to === address)
		.map((delegation) => {
			const voteLockPeriodInMs = convictionVotingPeriodInBlocks.mul(new BN(delegation.lockPeriod)).mul(new BN(NETWORKS_DETAILS[network as ENetwork].blockTime));

			return {
				address: delegation.from,
				balance: delegation.balance,
				createdAt: new Date(delegation.createdAt),
				lockPeriod: delegation.lockPeriod,
				endsAt: dayjs(delegation.createdAt).add(voteLockPeriodInMs.toNumber(), 'ms').toDate()
			};
		});

	const delegatedTo = delegationsForTrack
		.filter((delegation) => delegation.from === address)
		.map((delegation) => {
			const voteLockPeriodInMs = convictionVotingPeriodInBlocks.mul(new BN(delegation.lockPeriod)).mul(new BN(NETWORKS_DETAILS[network as ENetwork].blockTime));

			return {
				address: delegation.to,
				balance: delegation.balance,
				createdAt: new Date(delegation.createdAt),
				lockPeriod: delegation.lockPeriod,
				endsAt: dayjs(delegation.createdAt).add(voteLockPeriodInMs.toNumber(), 'ms').toDate()
			};
		});

	const response: ITrackDelegationDetails = {
		receivedDelegations,
		delegatedTo,
		activeProposalListingWithDelegateVote,
		status: receivedDelegations.length ? EDelegationStatus.RECEIVED : delegatedTo.length ? EDelegationStatus.DELEGATED : EDelegationStatus.UNDELEGATED
	};

	return NextResponse.json(response);
});
