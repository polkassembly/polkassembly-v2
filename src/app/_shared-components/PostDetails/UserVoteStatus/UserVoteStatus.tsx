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
import UserVoteCard from './UserVoteCard/UserVoteCard';

interface UserVoteStatusProps {
	index: string;
	btnClassName?: string;
	size?: 'sm' | 'lg';
	track?: EPostOrigin;
	proposalType: EProposalType;
}

function UserVoteStatus({ index, btnClassName, size = 'lg', track, proposalType }: UserVoteStatusProps) {
	const { user } = useUser();

	const fetchVoteData = async () => {
		if (!user || !user.addresses.length) return null;
		const { data, error } = await NextApiClientService.getPostVotesByAddresses({
			proposalType,
			index,
			addresses: user.addresses
		});
		if (error) throw new Error(error.message || 'Failed to fetch vote data');
		if (!data) return null;
		return data;
	};

	const { data: voteData } = useQuery({
		queryKey: [EReactQueryKeys.USER_VOTES, proposalType, index, user?.id],
		queryFn: fetchVoteData,
		enabled: !!user && !!user.addresses.length,
		placeholderData: (prev) => prev,
		retry: true,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	return user && voteData && voteData.votes?.length > 0 ? (
		<UserVoteCard
			index={index}
			size={size}
			proposalType={proposalType}
			voteData={voteData}
			btnClassName={btnClassName}
			track={track}
		/>
	) : (
		<VoteReferendumButton
			index={index}
			btnClassName={cn('w-full', btnClassName)}
			size={size}
			iconClassName='hidden'
			track={track}
			proposalType={proposalType}
		/>
	);
}

export default UserVoteStatus;
