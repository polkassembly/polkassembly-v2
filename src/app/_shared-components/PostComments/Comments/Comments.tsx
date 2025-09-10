// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAllowedCommentor, EProposalType, ICommentResponse } from '@/_shared/types';
import { useMemo, useState, useCallback, useLayoutEffect, useEffect } from 'react';
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
import { Button } from '@ui/Button';
import SingleComment from '../SingleComment/SingleComment';
import classes from './Comments.module.scss';

const AddComment = dynamic(() => import('../AddComment/AddComment'), { ssr: false });

function Comments({
	comments: commentsFromProps,
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
	const [showUnverified, setShowUnverified] = useState(false);
	const [comments, setComments] = useState<ICommentResponse[]>(commentsFromProps);
	const [identitiesLoaded, setIdentitiesLoaded] = useState<boolean>(false);

	interface CommentWithVerification extends ICommentResponse {
		isVerified?: boolean;
	}

	useEffect(() => {
		const allCommentsHaveIdentityCheck = comments.every((comment) => typeof (comment as CommentWithVerification).isVerified !== 'undefined');

		if (allCommentsHaveIdentityCheck && comments.length > 0) {
			setIdentitiesLoaded(true);
		}
	}, [comments]);

	const verifiedComments = useMemo(() => {
		return comments.filter((comment) => !comment.isSpam && (comment as CommentWithVerification).isVerified);
	}, [comments]);

	const unverifiedComments = useMemo(() => {
		if (!identitiesLoaded) return [];
		return comments.filter((comment) => !comment.isSpam && !(comment as CommentWithVerification).isVerified);
	}, [comments, identitiesLoaded]);

	const spamComments = useMemo(() => {
		return comments.filter((comment) => comment.isSpam);
	}, [comments]);

	const verifiedCommentsToShow = showMore ? verifiedComments : verifiedComments.slice(0, 2);

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
	}, [allowedCommentor, onchainIdentities, user, postUserId, t]);

	// Handle comment link navigation
	const handleCommentLink = useCallback(() => {
		const { hash } = window?.location || { hash: '' };
		if (!hash) return;

		const commentId = hash.replace('#comment-', '');
		const comment = [...verifiedComments, ...unverifiedComments, ...spamComments].find((c) => c.id === commentId);

		if (!comment) return;

		if (verifiedComments.includes(comment) && !showMore && verifiedComments.indexOf(comment) >= 2) {
			handleShowMore();
		}

		if (unverifiedComments.includes(comment) && !showUnverified) {
			setShowUnverified(true);
		}

		if (spamComments.includes(comment) && !showSpam) {
			setShowSpam(true);
		}

		// Use requestAnimationFrame to ensure the DOM is ready
		requestAnimationFrame(() => {
			const element = document.getElementById(hash.substring(1));
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		});
	}, [verifiedComments, unverifiedComments, spamComments, showMore, showUnverified, showSpam]);

	// Call handleCommentLink when the component mounts
	useLayoutEffect(() => {
		handleCommentLink();
	}, [handleCommentLink]);

	useEffect(() => {
		setComments(commentsFromProps);
	}, [commentsFromProps]);

	return (
		<div className={classes.wrapper}>
			<div className='flex flex-col gap-y-4 px-4 lg:px-6'>
				{verifiedCommentsToShow?.map((item) => (
					<SingleComment
						key={item.id}
						commentData={item}
						setComments={setComments}
					/>
				))}

				{showMore && verifiedComments?.length > 2 ? (
					<div className='flex justify-center'>
						<span
							onClick={handleShowLess}
							className={classes.loadMoreComments}
							aria-hidden='true'
						>
							{t('ActivityFeed.PostItem.showLessComments')} <FiArrowUpCircle className='text-lg' />
						</span>
					</div>
				) : !showMore && verifiedComments?.length > 2 ? (
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

				{unverifiedComments.length > 0 && identitiesLoaded && (
					<div className='mt-4 border-y border-border_grey py-4'>
						<Button
							variant='ghost'
							onClick={() => setShowUnverified(!showUnverified)}
							className='flex w-full items-center justify-center gap-x-2 text-sm font-medium text-blue-500'
							aria-expanded={showUnverified}
							aria-controls='unverified-comments-section'
						>
							{showUnverified ? t('PostDetails.hideUnverifiedComments') : t('PostDetails.showUnverifiedComments')}
							<span className='text-blue-500'>({unverifiedComments.length})</span>
							{showUnverified ? <FaChevronUp className='text-base' /> : <FaChevronDown className='text-base' />}
						</Button>
						{showUnverified && (
							<div
								id='unverified-comments-section'
								className='mt-4 flex flex-col gap-y-4'
							>
								{unverifiedComments.map((item) => (
									<SingleComment
										key={item.id}
										commentData={item}
										setComments={setComments}
									/>
								))}
							</div>
						)}
					</div>
				)}

				{spamComments.length > 0 && identitiesLoaded && (
					<div className='mt-4 border-y border-border_grey py-4'>
						<Button
							variant='ghost'
							onClick={() => setShowSpam(!showSpam)}
							className='flex w-full items-center justify-center gap-x-2 text-sm font-medium text-pink-500'
							aria-expanded={showSpam}
							aria-controls='spam-comments-section'
						>
							{showSpam ? t('PostDetails.hideLikelySpam') : t('PostDetails.showLikelySpam')}
							<span className='text-pink-500'>({spamComments.length})</span>
							{showSpam ? <FaChevronUp className='text-base' /> : <FaChevronDown className='text-base' />}
						</Button>
						{showSpam && (
							<div
								id='spam-comments-section'
								className='mt-4 flex flex-col gap-y-4'
							>
								{spamComments.map((item) => (
									<SingleComment
										key={item.id}
										commentData={item}
										setComments={setComments}
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
							id='commentForm'
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
						id='commentLoginPrompt'
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
