// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAllowedCommentor, EProposalType, ICommentResponse, ICommentWithIdentityStatus } from '@/_shared/types';
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
import LoadingLayover from '../../LoadingLayover';
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
	const [isVerifyingComments, setIsVerifyingComments] = useState(true);

	const hasIdentityStatus = (comment: ICommentResponse): comment is ICommentWithIdentityStatus => {
		return 'isVerified' in comment && typeof comment.isVerified === 'boolean';
	};

	const { verifiedComments, unverifiedComments, spamComments, allCommentsProcessed } = useMemo(() => {
		const verified: ICommentWithIdentityStatus[] = [];
		const unverified: ICommentWithIdentityStatus[] = [];
		const spam: ICommentResponse[] = [];

		comments.forEach((comment) => {
			if (comment.isSpam) {
				spam.push(comment);
			} else if (hasIdentityStatus(comment) && comment.isVerified) {
				verified.push(comment);
			} else if (hasIdentityStatus(comment)) {
				unverified.push(comment);
			}
		});

		const allProcessed = comments.length === 0 || comments.every((c) => typeof c.isSpam === 'boolean' || hasIdentityStatus(c));

		return {
			verifiedComments: verified,
			unverifiedComments: unverified,
			spamComments: spam,
			allCommentsProcessed: allProcessed
		};
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
		const comment = comments.find((c) => c.id === commentId);

		if (!comment) return;

		const isVerified = !comment.isSpam && hasIdentityStatus(comment) && comment.isVerified;
		if (isVerified) {
			const verifiedIndex = comments.filter((c) => !c.isSpam && hasIdentityStatus(c) && c.isVerified).findIndex((c) => c.id === comment.id);
			if (verifiedIndex >= 2) {
				setShowMore(true);
			}
		}

		const isUnverified = !comment.isSpam && hasIdentityStatus(comment) && !comment.isVerified;
		if (isUnverified) {
			setShowUnverified(true);
		}

		if (comment.isSpam) {
			setShowSpam(true);
		}

		// Use requestAnimationFrame to ensure the DOM is ready
		requestAnimationFrame(() => {
			const element = document.getElementById(hash.substring(1));
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		});
	}, [comments]);

	// Call handleCommentLink when the component mounts
	useLayoutEffect(() => {
		handleCommentLink();
	}, [handleCommentLink]);

	useEffect(() => {
		setComments(commentsFromProps);
		setIsVerifyingComments(true);
	}, [commentsFromProps]);

	useEffect(() => {
		if (!allCommentsProcessed) {
			return undefined;
		}

		const timer = setTimeout(() => {
			setIsVerifyingComments(false);
		}, 500);

		return () => {
			clearTimeout(timer);
		};
	}, [allCommentsProcessed]);

	return (
		<div className={classes.wrapper}>
			<div className='relative flex flex-col gap-y-4 px-4 lg:px-6'>
				{isVerifyingComments && <LoadingLayover />}
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

				{unverifiedComments.length > 0 && (
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

				{spamComments.length > 0 && (
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
