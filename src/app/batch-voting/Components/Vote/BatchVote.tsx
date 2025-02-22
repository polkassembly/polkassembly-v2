// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { canVote } from '@/_shared/_utils/canVote';
import { EConvictionAmount, EProposalType, EVoteDecision, IPostListing, IVoteCartItem } from '@/_shared/types';
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
	const [currentIndex, setCurrentIndex] = useState(0);
	const { user } = useUser();
	const queryClient = useQueryClient();
	const currentIndexRef = useRef(currentIndex);

	const [loading, setLoading] = useState(false);

	const fetchBatchVoteCart = async () => {
		if (!user?.id) return [];

		const { data, error } = await BatchVotingClientService.getBatchVoteCart({ userId: user.id });
		if (error || !data) {
			console.error(error);
			return [];
		}
		return data.voteCart;
	};

	const { data: voteCart, isFetching } = useQuery({
		queryKey: ['batch-vote-cart', user?.id],
		queryFn: fetchBatchVoteCart,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const filteredProposals = useMemo(() => {
		return proposals.filter(
			(proposal) =>
				canVote(proposal.onChainInfo?.status, proposal.onChainInfo?.preparePeriodEndsAt) &&
				(voteCart ? !voteCart.some((item) => Number(item.postIndexOrHash) === proposal.index || item.postIndexOrHash === proposal.hash) : true)
		);
	}, [proposals, voteCart]);

	const handleNext = () => {
		if (currentIndex < proposals.length) {
			setCurrentIndex(currentIndex + 1);
			currentIndexRef.current = currentIndex + 1;
		}
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

		setLoading(true);

		const amount = BatchVotingClientService.getAmountForDecision({
			voteDecision,
			ayeNayValue: defaultAyeNayValue,
			abstainValue: defaultAbstainValue,
			abstainAyeValue: defaultAbstainAyeValue,
			abstainNayValue: defaultAbstainNayValue
		});

		const { data, error } = await BatchVotingClientService.addToBatchVoteCart({
			userId: user.id,
			postIndexOrHash: proposalIndexOrHash,
			proposalType,
			decision: voteDecision,
			amount,
			conviction: defaultConviction
		});

		if (error || !data) {
			console.error(error);
			setLoading(false);
			return;
		}

		queryClient.setQueryData(['batch-vote-cart', user.id], (oldData: IVoteCartItem[]) => {
			return [
				...(oldData || []),
				{
					id: data.voteCartItem.id,
					createdAt: data.voteCartItem.createdAt,
					userId: user.id,
					postIndexOrHash: proposalIndexOrHash,
					proposalType,
					decision: voteDecision,
					amount,
					conviction: defaultConviction,
					updatedAt: new Date(),
					title
				}
			];
		});

		setLoading(false);
	};

	return (
		<div>
			<div className='hidden grid-cols-1 gap-4 sm:grid lg:grid-cols-3'>
				<div className='relative col-span-2 rounded-2xl bg-bg_modal p-4'>
					{isFetching && <LoadingLayover />}
					<ProposalScreen
						proposals={filteredProposals}
						handleNext={handleNext}
						currentIndex={currentIndex}
						addToVoteCart={addToVoteCart}
					/>
				</div>
				<div className='relative col-span-1 rounded-2xl bg-bg_modal p-4'>
					{(isFetching || loading) && <LoadingLayover />}
					<VoteCart voteCart={voteCart || []} />
				</div>
			</div>
			<TinderVoting
				filteredProposals={filteredProposals}
				handleNext={handleNext}
				loading={loading}
				currentIndexRef={currentIndexRef}
				addToVoteCart={addToVoteCart}
				isFetching={isFetching}
				voteCart={voteCart || []}
				currentIndex={currentIndex}
				proposals={proposals}
			/>
		</div>
	);
}

export default BatchVote;
