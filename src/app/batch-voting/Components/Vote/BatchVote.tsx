// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { canVote } from '@/_shared/_utils/canVote';
import { EConvictionAmount, EProposalType, EVoteDecision, IPostListing, IVoteCartItem } from '@/_shared/types';
import { BN } from '@polkadot/util';
import { useState, useMemo, useRef, createRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { BatchVotingClientService } from '@/app/_client-services/batch_voting_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import TinderCard from 'react-tinder-card';
import ActivityFeedPostItem from '@/app/(home)/Components/ActivityFeedPostItem/ActivityFeedPostItem';
import { Button } from '@/app/_shared-components/Button';
import { Ban, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/app/_shared-components/Drawer';
import ProposalScreen from './ProposalScreen/ProposalScreen';
import VoteCart from './VoteCart/VoteCart';

enum ESwipeDirection {
	RIGHT = 'right',
	LEFT = 'left',
	UP = 'up'
}

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

	const currentIndexRef = useRef(currentIndex);

	const childRefs = useMemo(
		() =>
			Array(filteredProposals.length)
				.fill(0)
				.map(() => createRef()),
		[filteredProposals]
	);

	const handleNext = () => {
		if (currentIndex < filteredProposals.length - 1) {
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

	const onSwipe = (dir: ESwipeDirection) => {
		if (currentIndex >= 0 && currentIndex < filteredProposals.length) {
			const proposal = filteredProposals[`${currentIndex}`];
			addToVoteCart({
				proposalIndexOrHash: proposal.index?.toString() || proposal.hash || '',
				proposalType: proposal.proposalType,
				title: proposal.title,
				voteDecision: dir === ESwipeDirection.RIGHT ? EVoteDecision.AYE : dir === ESwipeDirection.LEFT ? EVoteDecision.NAY : EVoteDecision.ABSTAIN
			});
			handleNext();
		}
	};

	const outOfFrame = (idx: number) => {
		if (currentIndexRef.current >= idx) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(childRefs[`${idx}`].current as any).restoreCard();
		}
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
			<div className='relative flex h-[500px] flex-col-reverse sm:hidden'>
				{isFetching && <LoadingLayover />}
				{filteredProposals.map((proposal, index) => (
					<TinderCard
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						ref={childRefs[`${index}`] as any}
						className='absolute top-0'
						key={`${proposal.title}-${proposal.index}`}
						onSwipe={(dir) => onSwipe(dir as ESwipeDirection)}
						preventSwipe={['down']}
						onCardLeftScreen={() => outOfFrame(index)}
					>
						<div className='h-[350px] rounded-2xl bg-bg_modal p-4'>
							<ActivityFeedPostItem
								commentBox={false}
								voteButton={false}
								postData={proposal}
								preventClick
							/>
						</div>
					</TinderCard>
				))}
				{voteCart && voteCart.length > 0 && (
					<div className='flex items-center justify-between gap-x-4'>
						<span>Proposals: {voteCart?.length}</span>
						<Drawer>
							<DrawerTrigger asChild>
								<Button size='sm'>View Cart</Button>
							</DrawerTrigger>
							<DrawerContent>
								<DrawerHeader className='flex items-center justify-between'>
									<DrawerTitle>Proposals</DrawerTitle>
									<DrawerClose asChild>
										<Button
											variant='ghost'
											size='icon'
										>
											<X className='h-4 w-4' />
										</Button>
									</DrawerClose>
								</DrawerHeader>
								<div className='w-full'>
									<VoteCart voteCart={voteCart} />
								</div>
							</DrawerContent>
						</Drawer>
					</div>
				)}
				<div className='flex w-full items-center justify-center gap-x-4 p-4'>
					<Button
						variant='ghost'
						className='rounded-full bg-failure p-2'
						size='icon'
						onClick={() => onSwipe(ESwipeDirection.LEFT)}
						disabled={loading}
					>
						<ThumbsDown
							fill={THEME_COLORS.light.btn_primary_text}
							className='h-10 w-10'
						/>
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-full bg-white p-3 text-decision_bar_indicator shadow'
						onClick={() => onSwipe(ESwipeDirection.UP)}
						disabled={loading}
					>
						<Ban className='h-10 w-10' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-full bg-success p-2'
						onClick={() => onSwipe(ESwipeDirection.RIGHT)}
						disabled={loading}
					>
						<ThumbsUp
							fill={THEME_COLORS.light.btn_primary_text}
							className='h-10 w-10'
						/>
					</Button>
				</div>
			</div>
		</div>
	);
}

export default BatchVote;
