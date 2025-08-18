// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { EPostOrigin, EProposalType, EReactQueryKeys } from '@/_shared/types';
import VoteReferendumButton from '../VoteReferendumButton';
import UserVoteCard from '../UserVoteCard';

interface UserVoteStatusProps {
	index: string;
	btnClassName?: string;
	size?: 'sm' | 'lg';
	track?: EPostOrigin;
	proposalType: EProposalType;
}

function UserVoteStatus({ index, btnClassName, size = 'lg', track, proposalType }: UserVoteStatusProps) {
	const { user } = useUser();

	// Use login address to fetch
	const selectedAddress = user?.loginAddress;

	const { data: voteData } = useQuery({
		queryKey: [EReactQueryKeys.USER_VOTES, proposalType, index, selectedAddress],
		queryFn: async () => {
			if (!selectedAddress) return null;
			const { data, error } = await NextApiClientService.getPostVotesByAddress({
				proposalType,
				index,
				address: selectedAddress
			});
			if (error) throw new Error(error.message || 'Failed to fetch vote data');
			if (!data) return null;
			return data;
		},
		enabled: !!selectedAddress,
		retry: 1,
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	const hasVoted = Array.isArray(voteData?.votes) && voteData.votes.length > 0;

	return user && hasVoted ? (
		<UserVoteCard
			index={index}
			size={size}
			proposalType={proposalType}
			voteData={voteData}
			btnClassName={btnClassName}
			track={track}
			existingVote={hasVoted ? voteData?.votes[0] : undefined}
			loginAddress={selectedAddress}
		/>
	) : (
		<VoteReferendumButton
			index={index}
			btnClassName={cn('w-full', btnClassName)}
			size={size}
			iconClassName='hidden'
			hasVoted={hasVoted}
			track={track}
			proposalType={proposalType}
			existingVote={hasVoted ? voteData?.votes[0] : undefined}
		/>
	);
}

export default UserVoteStatus;
