// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EActivityName, IUserActivity } from '@/_shared/types';
import React, { ReactNode } from 'react';
import { MessageCircleMore, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import CreatedAtTime from '../../../CreatedAtTime/CreatedAtTime';
import classes from './Activity.module.scss';

function IconComponent({ icon, className }: { icon: ReactNode; className?: string }) {
	return <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border border-border_grey', className)}>{icon}</div>;
}

const activityText: Record<EActivityName, { title: string; icon: ReactNode; iconClassName?: string }> = {
	[EActivityName.REPLIED_TO_COMMENT]: {
		title: 'repliedToComment',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REACTED_TO_COMMENT]: {
		title: 'reactedToComment',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REACTED_TO_POST]: {
		title: 'reactedToPost',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_TIP]: {
		title: 'createdTip',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.GAVE_TIP]: {
		title: 'gaveTip',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_PROPOSAL]: {
		title: 'createdProposal',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTED_ON_PROPOSAL]: {
		title: 'voted',
		icon: (
			<ThumbsUp
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_BOUNTY]: {
		title: 'createdBounty',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_CHILD_BOUNTY]: {
		title: 'createdChildBounty',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CLAIMED_BOUNTY]: {
		title: 'claimedBounty',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.SIGNED_UP_FOR_IDENTITY_VERIFICATION]: {
		title: 'signedUpForIdentityVerification',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VERIFIED_IDENTITY]: {
		title: 'verifiedIdentity',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMPLETED_IDENTITY_JUDGEMENT]: {
		title: 'completedIdentityJudgement',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.DELEGATED_VOTE]: {
		title: 'delegatedVote',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_DELEGATION]: {
		title: 'receivedDelegation',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PLACED_DECISION_DEPOSIT]: {
		title: 'placedDecisionDeposit',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_VOTE]: {
		title: 'removedVote',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REDUCED_CONVICTION]: {
		title: 'reducedConviction',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REDUCED_CONVICTION_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		title: 'reducedConvictionAfterSixHours',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_VOTE_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		title: 'removedVoteAfterSixHours',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LOST_DUE_TO_SLASHING_TIP_OR_PROPOSAL]: {
		title: 'lostDueToSlashing',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PROPOSAL_FAILED]: {
		title: 'proposalFailed',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PROPOSAL_PASSED]: {
		title: 'proposalPassed',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTE_PASSED]: {
		title: 'votePassed',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTE_FAILED]: {
		title: 'voteFailed',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.QUIZ_ANSWERED_CORRECTLY]: {
		title: 'quizAnsweredCorrectly',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.APPROVED_BOUNTY]: {
		title: 'approvedBounty',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_ADDRESS]: {
		title: 'linkedAddress',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMMENTED_ON_POST]: {
		title: 'addedComment',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		),
		iconClassName: 'border-navbar_border'
	},
	[EActivityName.DELETED_COMMENT]: {
		title: 'deletedComment',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_OFFCHAIN_POST]: {
		title: 'createdOffchainPost',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_DISCUSSION]: {
		title: 'linkedDiscussion',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.TOOK_QUIZ]: {
		title: 'tookQuiz',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.UPDATED_PROFILE]: {
		title: 'updatedProfile',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REPORTED_CONTENT]: {
		title: 'reportedContent',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_REPORT]: {
		title: 'receivedReport',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_SPAM_REPORT]: {
		title: 'receivedSpamReport',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_CONTENT]: {
		title: 'removedContent',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_LIKE_ON_DISCUSSION]: {
		title: 'receivedLikeOnDiscussion',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_LIKE_ON_COMMENT]: {
		title: 'receivedLikeOnComment',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.DELETED_REACTION]: {
		title: 'deletedReaction',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_CONTEXT_TO_PROPOSAL]: {
		title: 'addedContextToProposal',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_PICTURE]: {
		title: 'addedProfilePicture',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_BIO]: {
		title: 'addedBio',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_TITLE]: {
		title: 'addedProfileTitle',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_TAGS]: {
		title: 'addedProfileTags',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_MULTIPLE_ADDRESSES]: {
		title: 'linkedMultipleAddresses',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.POST_MARKED_AS_SPAM]: {
		title: 'postMarkedAsSpam',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMMENT_TAKEN_DOWN]: {
		title: 'commentTakenDown',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.POST_TAKEN_DOWN]: {
		title: 'postTakenDown',
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	}
};

function Activity({ activity }: { activity: IUserActivity }) {
	const t = useTranslations();
	return (
		<div className={classes.activityWrapper}>
			<div className={classes.activityTime}>
				<CreatedAtTime createdAt={activity.createdAt} />
			</div>
			<div className={classes.activityContent}>
				<div className={classes.activityContentInner}>
					<IconComponent
						icon={activityText[activity.name].icon}
						className={activityText[activity.name].iconClassName}
					/>
					<div className={classes.activityContentText}>
						<span>{t(`Profile.Activity.${activityText[activity.name].title}`)}</span>
						{activity.proposalType && activity.indexOrHash && (
							<span>
								{t('Profile.on')}{' '}
								<Link
									className={classes.activityContentTextLink}
									href={`/referenda/${activity.indexOrHash}`}
								>
									{activity.proposalType} - #{activity.indexOrHash}
								</Link>
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Activity;
