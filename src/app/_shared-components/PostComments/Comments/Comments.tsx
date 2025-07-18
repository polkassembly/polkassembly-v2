// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAllowedCommentor, EProposalType, ICommentResponse } from '@/_shared/types';
import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import Link from 'next/link';
import { FiArrowDownCircle } from '@react-icons/all-files/fi/FiArrowDownCircle';
import { FiArrowUpCircle } from '@react-icons/all-files/fi/FiArrowUpCircle';
import { FaChevronDown } from '@react-icons/all-files/fa/FaChevronDown';
import { FaChevronUp } from '@react-icons/all-files/fa/FaChevronUp';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useIdentityService } from '@/hooks/useIdentityService';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import dynamic from 'next/dynamic';
import SingleComment from '../SingleComment/SingleComment';
import classes from './Comments.module.scss';

const AddComment = dynamic(() => import('../AddComment/AddComment'), { ssr: false });

function Comments({
	comments,
	proposalType,
	index,
	allowedCommentor,
	postUserId
}: {
	comments: ICommentResponse[];
	proposalType: EProposalType;
	index: string;
	allowedCommentor: EAllowedCommentor;
	postUserId?: number;
}) {
	const t = useTranslations();
	const user = useAtomValue(userAtom);
	const [showMore, setShowMore] = useState(false);
	const [showSpam, setShowSpam] = useState(false);

	const regularComments = useMemo(() => comments.filter((comment) => !comment.isSpam), [comments]);
	const spamComments = useMemo(() => comments.filter((comment) => comment.isSpam), [comments]);
	const commentsToShow = showMore ? regularComments : regularComments.slice(0, 2);

	const handleShowMore = () => {
		setShowMore(true);
	};

	const handleShowLess = () => {
		setShowMore(false);
	};

	const { getOnChainIdentity, identityService } = useIdentityService();

	const fetchOnChainIdentity = async () => {
		if (!user?.addresses?.length || !user?.id) return [];

		return Promise.all(user.addresses.map((address) => getOnChainIdentity(address)));
	};

	const { data: onchainIdentities } = useQuery({
		queryKey: ['onchainIdentities', user?.id],
		queryFn: fetchOnChainIdentity,
		enabled: !!user?.id && !!identityService,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: true,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	const { canComment, commentDisabledMessage } = useMemo(() => {
		if (user && postUserId && user.id === postUserId) return { canComment: true, commentDisabledMessage: '' };
		if (allowedCommentor === EAllowedCommentor.ALL) return { canComment: true, commentDisabledMessage: '' };
		if (allowedCommentor === EAllowedCommentor.ONCHAIN_VERIFIED) {
			return { canComment: onchainIdentities?.some((identity) => identity?.isVerified), commentDisabledMessage: t('PostDetails.commentsDisabledForNonVerifiedUsers') };
		}
		return { canComment: !(allowedCommentor === EAllowedCommentor.NONE), commentDisabledMessage: t('PostDetails.commentsDisabled') };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allowedCommentor, onchainIdentities]);

	return (
		<div className={classes.wrapper}>
			<div className='flex flex-col gap-y-4 px-4 lg:px-6'>
				{commentsToShow.map((item) => (
					<SingleComment
						key={item.id}
						commentData={item}
					/>
				))}
				{showMore && regularComments?.length > 2 ? (
					<div className='flex justify-center'>
						<span
							onClick={handleShowLess}
							className={classes.loadMoreComments}
							aria-hidden='true'
						>
							{t('ActivityFeed.PostItem.showLessComments')} <FiArrowUpCircle className='text-lg' />
						</span>
					</div>
				) : !showMore && regularComments?.length > 2 ? (
					<div className='flex justify-center'>
						<span
							onClick={handleShowMore}
							className={classes.loadMoreComments}
							aria-hidden='true'
						>
							{t('ActivityFeed.PostItem.loadMoreComments')} <FiArrowDownCircle className='text-lg' />
						</span>
					</div>
				) : null}

				{spamComments.length > 0 && (
					<div className='mt-4 border-y border-border_grey py-4'>
						<button
							type='button'
							onClick={() => setShowSpam(!showSpam)}
							className='flex w-full items-center justify-center gap-x-2 text-sm font-medium text-pink-500'
							aria-expanded={showSpam}
							aria-controls='spam-comments-section'
						>
							{showSpam ? t('PostDetails.hideLikelySpam') : t('PostDetails.showLikelySpam')}
							<span className='text-pink-500'>({spamComments.length})</span>
							{showSpam ? <FaChevronUp className='text-base' /> : <FaChevronDown className='text-base' />}
						</button>
						{showSpam && (
							<div className='mt-4 flex flex-col gap-y-4'>
								{spamComments.map((item) => (
									<SingleComment
										key={item.id}
										commentData={item}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{user ? (
				canComment ? (
					<div className='w-full px-6 py-6'>
						<AddComment
							proposalType={proposalType}
							proposalIndex={index}
							onOptimisticUpdate={handleShowMore}
						/>
					</div>
				) : (
					<div className={classes.loginToComment}>
						<p className='text-sm text-text_primary'>{commentDisabledMessage}</p>
					</div>
				)
			) : (
				<div className={classes.loginToComment}>
					{t('PostDetails.please')}
					<Link
						className='text-text_pink'
						href='/login'
					>
						{t('PostDetails.login')}
					</Link>{' '}
					{t('PostDetails.toComment')}
				</div>
			)}
		</div>
	);
}

export default Comments;
