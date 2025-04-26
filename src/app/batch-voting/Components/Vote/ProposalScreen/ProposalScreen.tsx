// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision, IPostListing } from '@/_shared/types';
import ActivityFeedPostItem from '@/app/(home)/activity-feed/Components/ActivityFeedPostItem/ActivityFeedPostItem';
import { Button } from '@/app/_shared-components/Button';
import { THEME_COLORS } from '@/app/_style/theme';
import { Ban, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

function ProposalScreen({
	proposals,
	addToVoteCart,
	disableButtons,
	onSkip
}: {
	proposals: IPostListing[];
	disableButtons?: boolean;
	onSkip: (proposal: IPostListing) => void;
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
}) {
	const t = useTranslations();

	if (!proposals || proposals.length === 0) {
		return <p className='text-center text-sm text-text_grey'>{t('BatchVote.noProposalsAvailable')}</p>;
	}

	const currentProposal = proposals[0];

	return (
		<div className='h-full'>
			{currentProposal && (
				<div className='relative flex h-full flex-col gap-y-4'>
					<Button
						variant='ghost'
						className='absolute right-0 top-0 z-50 text-sm text-text_pink'
						onClick={() => onSkip(currentProposal)}
					>
						{t('BatchVote.skip')}
					</Button>
					<div className='w-full flex-1'>
						<ActivityFeedPostItem
							commentBox={false}
							voteButton={false}
							postData={currentProposal}
						/>
					</div>
					<div className='flex w-full items-center gap-x-4'>
						<Button
							variant='secondary'
							disabled={disableButtons}
							className='w-full border-failure text-failure'
							leftIcon={
								<ThumbsDown
									fill={THEME_COLORS.light.failure}
									className='h-4 w-4'
								/>
							}
							onClick={() =>
								addToVoteCart({
									proposalIndexOrHash: currentProposal.index?.toString() || currentProposal.hash || '',
									proposalType: currentProposal.proposalType,
									title: currentProposal.title,
									voteDecision: EVoteDecision.NAY
								})
							}
						>
							{t('BatchVote.nay')}
						</Button>
						<Button
							disabled={disableButtons}
							variant='secondary'
							className='w-full border-decision_bar_indicator text-decision_bar_indicator'
							leftIcon={<Ban className='h-4 w-4' />}
							onClick={() =>
								addToVoteCart({
									proposalIndexOrHash: currentProposal.index?.toString() || currentProposal.hash || '',
									proposalType: currentProposal.proposalType,
									title: currentProposal.title,
									voteDecision: EVoteDecision.SPLIT_ABSTAIN
								})
							}
						>
							{t('BatchVote.abstain')}
						</Button>
						<Button
							disabled={disableButtons}
							variant='secondary'
							className='w-full border-success text-success'
							leftIcon={
								<ThumbsUp
									fill={THEME_COLORS.light.success}
									className='h-4 w-4'
								/>
							}
							onClick={() =>
								addToVoteCart({
									proposalIndexOrHash: currentProposal.index?.toString() || currentProposal.hash || '',
									proposalType: currentProposal.proposalType,
									title: currentProposal.title,
									voteDecision: EVoteDecision.AYE
								})
							}
						>
							{t('BatchVote.aye')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default ProposalScreen;
