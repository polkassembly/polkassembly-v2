// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EProposalType, EVoteDecision, IPostListing, IVoteCartItem } from '@/_shared/types';
import ActivityFeedPostItem from '@/app/(home)/activity-feed/Components/ActivityFeedPostItem/ActivityFeedPostItem';
import { Button } from '@/app/_shared-components/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/app/_shared-components/Drawer';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { THEME_COLORS } from '@/app/_style/theme';
import { Ban, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createRef, RefObject, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import { cn } from '@/lib/utils';
import VoteCart from '../VoteCart/VoteCart';
import classes from './TinderVoting.module.scss';

enum ESwipeDirection {
	RIGHT = 'right',
	LEFT = 'left',
	UP = 'up'
}

function TinderVoting({
	disableButtons,
	filteredProposals,
	addToVoteCart,
	isLoading,
	voteCart,
	currentIndexRef,
	onSkip
}: {
	disableButtons?: boolean;
	currentIndexRef: RefObject<number>;
	filteredProposals: IPostListing[];
	isLoading: boolean;
	voteCart: IVoteCartItem[];
	addToVoteCart: ({
		voteDecision,
		proposalIndexOrHash,
		proposalType,
		title
	}: {
		voteDecision: EVoteDecision;
		proposalIndexOrHash: string;
		proposalType: EProposalType;
		title?: string;
	}) => void;
	onSkip: (proposal: IPostListing) => void;
}) {
	const t = useTranslations();

	const childRefs = useMemo(
		() =>
			Array(filteredProposals.length)
				.fill(0)
				.map(() => createRef()),
		[filteredProposals]
	);

	const onSwipe = (dir: ESwipeDirection) => {
		if (filteredProposals.length > 0) {
			const proposal = filteredProposals[0];
			let voteDecision = EVoteDecision.AYE;
			if (dir === ESwipeDirection.RIGHT) {
				voteDecision = EVoteDecision.AYE;
			} else if (dir === ESwipeDirection.LEFT) {
				voteDecision = EVoteDecision.NAY;
			} else if (dir === ESwipeDirection.UP) {
				voteDecision = EVoteDecision.SPLIT_ABSTAIN;
			}

			addToVoteCart({
				proposalIndexOrHash: proposal.index?.toString() || proposal.hash || '',
				proposalType: proposal.proposalType,
				title: proposal.title,
				voteDecision
			});
		}
	};

	const outOfFrame = (idx: number) => {
		if (currentIndexRef.current >= idx && childRefs[`${idx}`]?.current) {
			try {
				const cardRef = childRefs[`${idx}`].current;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (cardRef && typeof (cardRef as any).restoreCard === 'function') {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(cardRef as any).restoreCard();
				}
			} catch (error) {
				console.log('Could not restore card', error);
			}
		}
	};

	const swipeThreshold = 50;
	const swipeRequirementType = 'position';

	return (
		<div
			className={classes.tinderVoting}
			key={`tinder-voting-${filteredProposals.length}`}
		>
			{isLoading && <LoadingLayover />}
			<Button
				variant='ghost'
				className={classes.skipButton}
				onClick={() => onSkip(filteredProposals[0])}
			>
				{t('BatchVote.skip')}
			</Button>
			{filteredProposals.map((proposal, index) => (
				<div
					className={cn(classes.proposalCard, index !== 0 && 'hidden')}
					style={{
						zIndex: filteredProposals.length - index
					}}
					key={`${proposal.title}-${proposal.index}`}
				>
					<TinderCard
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						ref={childRefs[`${index}`] as any}
						key={`${proposal.title}-${proposal.index}`}
						onSwipe={(dir) => onSwipe(dir as ESwipeDirection)}
						preventSwipe={['down']}
						onCardLeftScreen={() => outOfFrame(index)}
						swipeRequirementType={swipeRequirementType}
						swipeThreshold={swipeThreshold}
						flickOnSwipe
					>
						<div
							data-swipeable='true'
							className='relative w-full cursor-grab touch-manipulation'
						>
							<ActivityFeedPostItem
								commentBox={false}
								voteButton={false}
								postData={proposal}
								preventClick
							/>
						</div>
					</TinderCard>
				</div>
			))}
			{voteCart && voteCart.length > 0 && (
				<div className={classes.voteCart}>
					<span>
						{t('BatchVote.totalProposals')}: {voteCart?.length}
					</span>
					<Drawer>
						<DrawerTrigger asChild>
							<Button size='sm'>{t('BatchVote.viewCart')}</Button>
						</DrawerTrigger>
						<DrawerContent className='bg-bg_modal px-4 pb-4'>
							<DrawerHeader className='flex items-center justify-between'>
								<DrawerTitle>{t('BatchVote.proposals')}</DrawerTitle>
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
			<div className={classes.voteButtons}>
				<Button
					variant='ghost'
					className='rounded-full bg-failure p-2'
					size='icon'
					onClick={() => onSwipe(ESwipeDirection.LEFT)}
					disabled={disableButtons}
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
					disabled={disableButtons}
				>
					<Ban className='h-10 w-10' />
				</Button>
				<Button
					variant='ghost'
					size='icon'
					className='rounded-full bg-success p-2'
					onClick={() => onSwipe(ESwipeDirection.RIGHT)}
					disabled={disableButtons}
				>
					<ThumbsUp
						fill={THEME_COLORS.light.btn_primary_text}
						className='h-10 w-10'
					/>
				</Button>
			</div>
		</div>
	);
}

export default TinderVoting;
