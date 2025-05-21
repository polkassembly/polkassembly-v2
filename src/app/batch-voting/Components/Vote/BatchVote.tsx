// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { canVote } from '@/_shared/_utils/canVote';
import { EConvictionAmount, EProposalType, EReactQueryKeys, EVoteDecision, IPostListing, IVoteCartItem } from '@/_shared/types';
import { BN } from '@polkadot/util';
import { useState, useMemo, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { BatchVotingClientService } from '@/app/_client-services/batch_voting_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import ProposalScreen from './ProposalScreen/ProposalScreen';
import VoteCart from './VoteCart/VoteCart';
import TinderVoting from './TinderVotingMobile/TinderVoting';

function BatchVote({
	proposals,
	defaultAyeNayValue,
	defaultAbstainValue,
	defaultAbstainAyeValue,
	defaultAbstainNayValue,
	defaultConviction
}: {
	proposals: IPostListing[];
	defaultAyeNayValue: BN;
	defaultAbstainValue: BN;
	defaultAbstainAyeValue: BN;
	defaultAbstainNayValue: BN;
	defaultConviction: EConvictionAmount;
}) {
	const { user } = useUser();
	const queryClient = useQueryClient();
	const currentIndexRef = useRef(0);

	const fetchBatchVoteCart = async () => {
		if (!user?.id) return [];

		const { data, error } = await BatchVotingClientService.getBatchVoteCart({ userId: user.id });
		if (error || !data) {
			console.error(error);
			return [];
		}
		return data.voteCart;
	};

	const { data: voteCart, isLoading } = useQuery({
		queryKey: [EReactQueryKeys.BATCH_VOTE_CART, user?.id],
		queryFn: fetchBatchVoteCart,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false
	});

	const [skippedProposals, setSkippedProposals] = useState<IPostListing[]>([]);

	const filteredProposals = useMemo(() => {
		return proposals.filter((proposal) => {
			return (
				canVote(proposal.onChainInfo?.status) &&
				(voteCart ? !voteCart.some((item) => Number(item.postIndexOrHash) === proposal.index || item.postIndexOrHash === proposal.hash) : true) &&
				!skippedProposals.some((skippedProposal) => skippedProposal.index === proposal.index || (skippedProposal.hash && skippedProposal.hash === proposal.hash))
			);
		});
	}, [proposals, voteCart, skippedProposals]);

	const onSkipProposal = (proposal: IPostListing) => {
		setSkippedProposals([...skippedProposals, proposal]);
	};

	const addToVoteCart = async ({
		voteDecision,
		proposalIndexOrHash,
		proposalType,
		title
	}: {
		voteDecision: EVoteDecision;
		proposalIndexOrHash: string;
		proposalType: EProposalType;
		title?: string;
	}) => {
		if (!user?.id) return;

		const amount = BatchVotingClientService.getAmountForDecision({
			voteDecision,
			ayeNayValue: defaultAyeNayValue,
			abstainValue: defaultAbstainValue,
			abstainAyeValue: defaultAbstainAyeValue,
			abstainNayValue: defaultAbstainNayValue
		});

		// Create the new vote cart item
		const newItem = {
			id: proposalIndexOrHash, // temporary id
			createdAt: new Date(),
			userId: user.id,
			postIndexOrHash: proposalIndexOrHash,
			proposalType,
			decision: voteDecision,
			amount,
			conviction: defaultConviction,
			updatedAt: new Date(),
			title,
			editDisabled: true
		};

		// Store the previous state to enable rollback
		const previousData = queryClient.getQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id]) as IVoteCartItem[];

		// Optimistically update the UI
		queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], (old: IVoteCartItem[] = []) => [...old, newItem]);

		try {
			const { data, error } = await BatchVotingClientService.addToBatchVoteCart({
				userId: user.id,
				postIndexOrHash: proposalIndexOrHash,
				proposalType,
				decision: voteDecision,
				amount,
				conviction: defaultConviction
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to add to vote cart');
			}

			// Update the item with server-returned id and createdAt
			queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], (old: IVoteCartItem[] = []) =>
				old.map((item) =>
					item.postIndexOrHash === proposalIndexOrHash ? { ...item, id: data.voteCartItem.id, createdAt: data.voteCartItem.createdAt, editDisabled: false } : item
				)
			);
		} catch (error) {
			// Revert to previous state if the API call fails
			queryClient.setQueryData([EReactQueryKeys.BATCH_VOTE_CART, user.id], previousData);
			console.error('Failed to add to vote cart:', error);
		}
	};

	return (
		<div>
			<div className='hidden grid-cols-1 place-items-start gap-4 sm:grid lg:grid-cols-3'>
				<div className='col-span-2 w-full rounded-2xl bg-bg_modal p-4'>
					<ProposalScreen
						proposals={filteredProposals}
						addToVoteCart={addToVoteCart}
						onSkip={onSkipProposal}
					/>
				</div>
				<div className='relative col-span-1 w-full rounded-2xl bg-bg_modal p-4'>
					{isLoading && <LoadingLayover />}
					<VoteCart voteCart={voteCart || []} />
				</div>
			</div>
			<TinderVoting
				filteredProposals={filteredProposals}
				currentIndexRef={currentIndexRef}
				addToVoteCart={addToVoteCart}
				isLoading={isLoading}
				voteCart={voteCart || []}
				onSkip={onSkipProposal}
			/>
		</div>
	);
}

export default BatchVote;
