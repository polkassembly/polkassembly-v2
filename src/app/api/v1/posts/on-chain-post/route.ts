// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EAllowedCommentor, ENetwork, EProposalType, ICommentResponse } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { headers } from 'next/headers';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { htmlToMarkdown } from '@/_shared/_utils/htmlToMarkdown';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { cacheExchange, Client as UrqlClient, fetchExchange } from '@urql/core';
import { fetchPostData } from '../../../_api-utils/fetchPostData';
import { APIError } from '../../../_api-utils/apiError';
import { EV1ProposalType, IOnChainPost } from '../../_v1_api-utils/types';
import { getUpdatedComments, handleReactions, v1ToV2ProposalType } from '../../_v1_api-utils/utils';

const SUBSQUID_QUERY = `query ProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    proposalArguments{
      args
      section
      method
    }
    preimage {
      proposer
      method
      hash
      proposedCall {
        method
        args
        description
        section
      }
    }
    description
    parentBountyIndex
    hash
    curator
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    origin
    trackNumber
    end
    createdAt
    updatedAt
    delay
    endedAt
    deposit
    bond
    reward
    payee
    fee
    curatorDeposit
    proposalArguments {
      method
      args
      description
      section
    }
    group {
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
          proposer
        }
        hash
      }
    }
    statusHistory(limit: 25) {
      timestamp
      status
      block
    }
    tally {
      ayes
      bareAyes
      nays
      support
    }
    enactmentAfterBlock
    enactmentAtBlock
    decisionDeposit {
      amount
      who
    }
    submissionDeposit {
      amount
      who
    }
    deciding {
      confirming
      since
    }
  }
}
`;

const subsquidGqlClient = (network: ENetwork) => {
	const subsquidUrl = NETWORKS_DETAILS[network.toString() as keyof typeof NETWORKS_DETAILS]?.subsquidUrl;

	if (!subsquidUrl) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Subsquid URL not found for the given network');
	}

	return new UrqlClient({
		url: subsquidUrl,
		exchanges: [cacheExchange, fetchExchange]
	});
};

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		postId: z.string(),
		proposalType: z.nativeEnum(EV1ProposalType).transform(v1ToV2ProposalType),
		noComments: z.coerce.boolean().optional().default(false),
		includeSubsquareComments: z.coerce.boolean().optional().default(true)
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key, value]) => [key, value]));

	const { postId, proposalType, noComments, includeSubsquareComments } = zodQuerySchema.parse(searchParamsObject);

	const [network] = await Promise.all([getNetworkFromHeaders(), headers()]);

	let post = await fetchPostData({
		network,
		proposalType,
		indexOrHash: postId
	});

	const reactions = await OffChainDbService.GetPostReactions({ network, proposalType, indexOrHash: postId });
	post = { ...post, reactions };

	let comments: ICommentResponse[] = [];
	if (!noComments) {
		comments = await OffChainDbService.GetPostComments({ network, proposalType, indexOrHash: postId });
	}

	const gqlClient = subsquidGqlClient(network);

	const { data: subsquidData } = await gqlClient
		.query(SUBSQUID_QUERY, { ...(proposalType === EProposalType.TIP ? { hash_eq: postId } : { index_eq: Number(postId) }), type_eq: proposalType })
		.toPromise();

	const postData = subsquidData?.proposals[0] || null;

	// TODO: Add support for on-chain post
	const preimage = postData?.preimage;
	const proposalArguments = postData?.proposalArguments || postData?.callData;
	const proposedCall = preimage?.proposedCall || postData?.proposalArguments?.args;

	const updatedPost: IOnChainPost = {
		allowedCommentors: post?.allowedCommentor || EAllowedCommentor.ALL,
		assetId: null,
		beneficiaries:
			post?.onChainInfo?.beneficiaries?.map((beneficiary) => ({
				address: beneficiary.address,
				amount: beneficiary.amount,
				genralIndex: beneficiary.assetId
			})) || [],
		bond: postData?.bond,
		title: post?.title || '',
		tags: post?.tags?.map((tag) => tag.value) || [],
		comments: getUpdatedComments(comments, post, proposalType, includeSubsquareComments),
		content: post?.content || '',
		created_at: postData?.createdAt,
		curator: postData?.curator,
		curator_deposit: postData?.curatorDeposit,
		dataSource: post?.dataSource || 'polkassembly',
		deciding: postData?.deciding,
		decision_deposit_amount: postData?.decisionDeposit?.amount,
		delay: postData?.delay,
		deposit: postData?.deposit,
		description: postData?.description,
		enactment_after_block: postData?.enactmentAfterBlock,
		enactment_at_block: postData?.enactmentAtBlock,
		end: postData?.end,
		ended_at: postData?.endedAt,
		fee: postData?.fee,
		hash: postData?.hash || preimage?.hash,
		history:
			post?.history?.map((history) => ({
				content: history.content || '',
				created_at: history.createdAt,
				title: history.title || ''
			})) || [],
		identity: postData?.identity || null,
		last_edited_at: post?.updatedAt?.toDateString() || null,
		markdownContent: htmlToMarkdown(post?.content || ''),
		method: preimage?.method || proposedCall?.method || proposalArguments?.method,
		origin: postData?.origin,
		payee: postData?.payee,
		pips_voters: postData?.voting || [],
		user_id: post?.publicUser?.id || 0,
		username: post?.publicUser?.username || '',
		post_id: postData?.index,
		post_reactions: handleReactions(postData?.reactions || []),
		preimageHash: preimage?.hash || '',
		proposalHashBlock: postData?.proposalHashBlock || null,
		proposal_arguments: proposalArguments,
		proposed_call: proposedCall,
		proposer: postData?.proposer,
		reward: postData?.reward,
		status: postData?.status,
		statusHistory: postData?.statusHistory,
		submission_deposit_amount: postData?.submissionDeposit?.amount,
		submitted_amount: postData?.submissionDeposit?.amount,
		subscribers: [],
		tally: postData?.tally,
		timeline: [],
		track_number: postData?.trackNumber,
		type: postData?.type,
		post_link: null,
		post_type: proposalType,
		updated_at: post?.updatedAt || new Date(),
		progress_report: [],
		comments_count: comments.length
	};

	return NextResponse.json(updatedPost);
});
