// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import { ESocial, IDelegateDetails, IOnChainIdentity, IFollowEntry, IPublicUser } from '@/_shared/types';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import { useIdentityService } from '@/hooks/useIdentityService';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Address from '@ui/Profile/Address/Address';
import { ShieldPlus, UserIcon } from 'lucide-react';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { useUser } from '@/hooks/useUser';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import DelegateVotingPower from '@/app/_shared-components/DelegateVotingPower/DelegateVotingPower';
import Link from 'next/link';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { usePathname } from 'next/navigation';
import styles from './PeopleCard.module.scss';

const SocialIcons: Partial<Record<ESocial, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

function DelegateCard({ delegate }: { delegate: IDelegateDetails }) {
	const t = useTranslations();
	const delegateCtaTitle = t('Delegation.delegate');
	const { user } = useUser();
	const network = getCurrentNetwork();
	const pathname = usePathname();

	const { getOnChainIdentity, identityService } = useIdentityService();
	const [openModal, setOpenModal] = useState(false);
	const [openDelegateDialog, setOpenDelegateDialog] = useState(false);
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);
	const [isIdentityFetching, setIsIdentityFetching] = useState(true);

	const [publicUser, setPublicUser] = useState<IPublicUser | undefined>(delegate.publicUser);

	const queryClient = useQueryClient();

	const mainJudgement = identity?.judgements?.[0]?.[1];
	const displayJudgement = mainJudgement ? (typeof mainJudgement === 'object' ? Object.keys(mainJudgement)[0] : String(mainJudgement)) : t('Profile.noJudgements');

	useEffect(() => {
		const fetchPublicUser = async () => {
			if (!delegate.publicUser && delegate.address) {
				const { data, error } = await UserProfileClientService.fetchPublicUserByAddress({ address: delegate.address });
				if (data && !error) {
					setPublicUser(data);
				}
			}
		};
		fetchPublicUser();
	}, [delegate.publicUser, delegate.address]);

	useEffect(() => {
		const fetchIdentity = async () => {
			if (!delegate?.address) {
				setIsIdentityFetching(false);
				return;
			}

			try {
				setIsIdentityFetching(true);
				const identityInfo = await getOnChainIdentity(delegate.address);
				if (identityInfo) {
					setIdentity(identityInfo);
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			} finally {
				setIsIdentityFetching(false);
			}
		};

		fetchIdentity();
	}, [delegate?.address, getOnChainIdentity]);

	const fetchFollowers = async () => {
		if (!publicUser?.id) return { followers: [] };
		const { data, error } = await UserProfileClientService.getFollowers({ userId: publicUser.id });
		if (error) {
			return { followers: [] };
		}
		return data;
	};

	const { data: followers, isFetching: isFetchingFollowers } = useQuery({
		queryKey: ['followers', publicUser?.id, user?.id],
		queryFn: () => fetchFollowers(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!publicUser?.id
	});

	const fetchFollowing = async () => {
		if (!publicUser?.id) return { following: [] };
		const { data, error } = await UserProfileClientService.getFollowing({ userId: publicUser.id });
		if (error) {
			return { following: [] };
		}
		return data;
	};

	const { data: following, isFetching: isFetchingFollowing } = useQuery({
		queryKey: ['following', publicUser?.id, user?.id],
		queryFn: () => fetchFollowing(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!publicUser?.id
	});

	const isFollowing = followers?.followers.some((item) => item.followerUserId === user?.id);

	const followUser = async () => {
		if (!publicUser?.id || !user?.id || user.id === publicUser.id) return;

		queryClient.setQueryData(['followers', publicUser.id, user?.id], (oldData: { followers: IFollowEntry[] } | undefined) => ({
			followers: [
				...(oldData?.followers || []),
				{
					id: publicUser?.id || 0,
					createdAt: new Date(),
					followerUserId: user.id,
					followedUserId: publicUser?.id || 0,
					updatedAt: new Date()
				}
			]
		}));

		const { data, error } = await UserProfileClientService.followUser({ userId: publicUser.id });

		if (!data || error) {
			queryClient.invalidateQueries({ queryKey: ['followers', publicUser.id, user?.id] });
		}
	};

	const unfollowUser = async () => {
		if (!publicUser?.id || !user?.id || user.id === publicUser.id) return;

		queryClient.setQueryData(['followers', publicUser.id, user?.id], (oldData: { followers: IFollowEntry[] } | undefined) => ({
			...oldData,
			followers: (oldData?.followers || []).filter((item) => item.followerUserId !== user.id)
		}));

		const { data, error } = await UserProfileClientService.unfollowUser({ userId: publicUser.id });

		if (!data || error) {
			queryClient.invalidateQueries({ queryKey: ['followers', publicUser.id, user?.id] });
		}
	};

	const creationDate = delegate.createdAt || publicUser?.createdAt;

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<Address
						disableTooltip
						address={delegate.address}
						iconSize={30}
						showIdenticon
						textClassName='text-left text-lg font-semibold'
					/>
				</div>
				<div className='flex items-center gap-x-2'>
					{publicUser?.id && user?.id && user.id !== publicUser.id && (
						<Button
							size='sm'
							variant='link'
							className='w-full rounded-3xl px-0 text-text_pink sm:w-auto'
							leftIcon={<ShieldPlus />}
							onClick={isFollowing ? unfollowUser : followUser}
							disabled={!user?.id}
						>
							{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
						</Button>
					)}

					{user?.id ? (
						<Dialog
							open={openDelegateDialog}
							onOpenChange={setOpenDelegateDialog}
						>
							<DialogTrigger asChild>
								<Button
									size='sm'
									className='w-full rounded-3xl sm:w-auto'
									leftIcon={<IoPersonAdd />}
								>
									{delegateCtaTitle}
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-screen-md p-6'>
								<DialogHeader>
									<DialogTitle className='flex items-center gap-x-2'>
										<IoPersonAdd />
										<span>{delegateCtaTitle}</span>
									</DialogTitle>
								</DialogHeader>
								<DelegateVotingPower
									delegate={delegate}
									onClose={() => setOpenDelegateDialog(false)}
								/>
							</DialogContent>
						</Dialog>
					) : (
						<Link href={`/login?redirect=${pathname}`}>
							<Button
								size='sm'
								className='w-full rounded-3xl sm:w-auto'
								leftIcon={<IoPersonAdd />}
							>
								{delegateCtaTitle}
							</Button>
						</Link>
					)}
				</div>
			</div>

			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					<CopyToClipboard
						label={shortenAddress(delegate.address, 5)}
						text={delegate.address}
						className='text-base'
					/>
					<div className='flex items-center gap-1 rounded-md bg-topic_tag_bg px-1.5 py-1'>
						<UserIcon className='h-4 w-4 text-basic_text' />
						<span className='text-xs text-basic_text'>{t('Community.Members.independent')}</span>
					</div>
					{publicUser?.profileScore !== undefined && (
						<span className='flex items-center gap-1 rounded-md bg-rank_card_bg px-1.5 py-0.5 font-medium'>
							<Image
								src={RankStar}
								alt='Rank Star'
								width={16}
								height={16}
							/>
							<span className='text-sm font-medium text-leaderboard_score'>{Math.floor(publicUser.profileScore)}</span>
						</span>
					)}
				</div>
				<div className='flex items-center gap-x-1'>
					<Image
						src={JudgementIcon}
						alt='judgement'
						width={14}
						height={14}
					/>
					{isIdentityFetching || !identityService ? (
						<Skeleton className='ml-2 h-4 w-16' />
					) : (
						<span className='text-xs text-basic_text'>
							{t('Profile.judgement')}: <span className='font-medium'>{displayJudgement}</span>
						</span>
					)}
				</div>
			</div>

			<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
				{creationDate && (
					<>
						<p className={styles.memberSince}>
							<span>{t('Profile.userSince')}: </span>{' '}
							<span className='flex items-center gap-x-1 text-xs'>
								<Image
									src={CalendarIcon}
									alt='calendar'
									width={20}
									height={20}
								/>
								{dayjs(creationDate).format("Do MMM 'YY")}
							</span>
						</p>
						<Separator
							className='h-4'
							orientation='vertical'
						/>
					</>
				)}

				<div className={styles.memberFollowing}>
					{t('Profile.following')}:{' '}
					{isFetchingFollowing ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{following?.following?.length || 0}</span>}
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}:{' '}
					{isFetchingFollowers ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{followers?.followers?.length || 0}</span>}
				</div>
			</div>

			<div className='px-1 pb-2 pt-2'>
				{delegate.manifesto ? (
					<MarkdownViewer
						markdown={delegate.manifesto}
						truncate
						onShowMore={() => setOpenModal(true)}
						className='line-clamp-2 text-sm text-text_primary'
					/>
				) : (
					<span className='text-text_secondary text-sm'>{t('Delegation.noBio')}</span>
				)}
			</div>

			<div className='flex items-center gap-x-4'>
				{publicUser?.profileDetails?.publicSocialLinks?.map((social) => {
					const IconComponent = SocialIcons[social.platform];
					return IconComponent ? (
						<a
							key={social.platform}
							href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
							target='_blank'
							className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
							rel='noreferrer noopener'
						>
							<IconComponent className='text-white' />
						</a>
					) : null;
				})}
			</div>

			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
							<span className='font-semibold md:text-2xl'>
								{formatUSDWithUnits(formatBnBalance(delegate.maxDelegated, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
							</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.maxDelegated')}</span>
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate.last30DaysVotedProposalsCount}</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.votedProposals')}</span>
						<span className={styles.delegationCardStatsItemTextPast30Days}>({t('Delegation.past30Days')})</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate.delegators?.length || 0}</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.delegators')}</span>
					</div>
				</div>
			</div>

			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
			>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle>
							<Address address={delegate.address} />
						</DialogTitle>
					</DialogHeader>
					{delegate.manifesto && (
						<MarkdownViewer
							className='max-h-[70vh] overflow-y-auto'
							markdown={delegate.manifesto}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
export default DelegateCard;
