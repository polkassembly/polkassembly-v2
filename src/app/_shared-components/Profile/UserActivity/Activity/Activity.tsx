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

const activityText: Record<EActivityName, { icon: ReactNode; iconClassName?: string }> = {
	[EActivityName.REPLIED_TO_COMMENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REACTED_TO_COMMENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REACTED_TO_POST]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_TIP]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.GAVE_TIP]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_PROPOSAL]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTED_ON_PROPOSAL]: {
		icon: (
			<ThumbsUp
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_BOUNTY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_CHILD_BOUNTY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CLAIMED_BOUNTY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.SIGNED_UP_FOR_IDENTITY_VERIFICATION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VERIFIED_IDENTITY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMPLETED_IDENTITY_JUDGEMENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.DELEGATED_VOTE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_DELEGATION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PLACED_DECISION_DEPOSIT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_VOTE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REDUCED_CONVICTION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REDUCED_CONVICTION_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_VOTE_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LOST_DUE_TO_SLASHING_TIP_OR_PROPOSAL]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PROPOSAL_FAILED]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.PROPOSAL_PASSED]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTE_PASSED]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.VOTE_FAILED]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.QUIZ_ANSWERED_CORRECTLY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.APPROVED_BOUNTY]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_ADDRESS]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMMENTED_ON_POST]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		),
		iconClassName: 'border-navbar_border'
	},
	[EActivityName.DELETED_COMMENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.CREATED_OFFCHAIN_POST]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_DISCUSSION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.TOOK_QUIZ]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.UPDATED_PROFILE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REPORTED_CONTENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_REPORT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_SPAM_REPORT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.REMOVED_CONTENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_LIKE_ON_DISCUSSION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.RECEIVED_LIKE_ON_COMMENT]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.DELETED_REACTION]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_CONTEXT_TO_PROPOSAL]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_PICTURE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_BIO]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_TITLE]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.ADDED_PROFILE_TAGS]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.LINKED_MULTIPLE_ADDRESSES]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.POST_MARKED_AS_SPAM]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.COMMENT_TAKEN_DOWN]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.POST_TAKEN_DOWN]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.UNLINKED_ADDRESS]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.UNLINKED_MULTIPLE_ADDRESSES]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.UNFOLLOWED_USER]: {
		icon: (
			<MessageCircleMore
				size={16}
				className='text-text_pink'
			/>
		)
	},
	[EActivityName.FOLLOWED_USER]: {
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
						<span>{t(`Profile.Activity.${activity.name}`)}</span>
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
