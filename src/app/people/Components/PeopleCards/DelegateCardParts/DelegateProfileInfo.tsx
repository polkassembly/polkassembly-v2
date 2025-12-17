// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EDelegateSource, IDelegateDetails, IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import ShieldPlusIcon from '@assets/icons/ShieldPlus.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import PALOGO from '@assets/delegation/pa-logo-small-delegate.svg';
import ParityLogo from '@assets/delegation/polkadot-logo.svg';
import NovaLogo from '@assets/delegation/nova-wallet.svg';
import W3FLogo from '@assets/delegation/w3f.svg';
import { FaUser } from '@react-icons/all-files/fa/FaUser';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Address from '@ui/Profile/Address/Address';
import { ShieldMinusIcon } from 'lucide-react';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import DelegateVotingPower from '@/app/_shared-components/DelegateVotingPower/DelegateVotingPower';
import { useUser } from '@/hooks/useUser';
import { ReactNode, useState } from 'react';
import styles from '../PeopleCard.module.scss';

const getPlatformCardStyle = (sources: EDelegateSource[]) => {
	if (!Array.isArray(sources) || sources.length === 0) {
		return 'bg-delegation_bgcard border-btn_secondary_text';
	}

	if (sources.length > 1) {
		return 'bg-delegation_bgcard border-wallet_btn_text';
	}

	const platform = String(sources[0]).toLowerCase();
	switch (platform) {
		case EDelegateSource.POLKASSEMBLY:
			return 'bg-delegation_card_polkassembly border-navbar_border';
		case EDelegateSource.PARITY:
			return 'bg-delegation_card_polkadot border-t-delegation_polkadot_border';
		case EDelegateSource.W3F:
			return 'bg-delegation_card_w3f text-btn_primary_text border-border_grey';
		case EDelegateSource.NOVA:
			return 'bg-delegation_card_nova border-delegation_nova_border';
		case EDelegateSource.INDIVIDUAL:
		case EDelegateSource.DELEGATEX:
			return 'bg-delegation_bgcard border-btn_secondary_text';
		default:
			return 'bg-delegation_bgcard border-wallet_btn_text';
	}
};

const logoMap: { [key in EDelegateSource]: StaticImageData | ReactNode } = {
	[EDelegateSource.NOVA]: NovaLogo,
	[EDelegateSource.PARITY]: ParityLogo,
	[EDelegateSource.POLKASSEMBLY]: PALOGO,
	[EDelegateSource.W3F]: W3FLogo,
	[EDelegateSource.INDIVIDUAL]: <FaUser className='text-text_primary' />,
	[EDelegateSource.DELEGATEX]: null
};

const renderSourceTag = (sources: EDelegateSource[]) => {
	if (!Array.isArray(sources) || sources.length === 0) {
		return (
			<div className='flex items-center gap-1'>
				<FaUser className='h-3 w-3 text-text_primary' />
				<span className='text-[10px] sm:text-xs'>Individual</span>
			</div>
		);
	}

	const platform = String(sources[0]).toLowerCase();
	const Logo = logoMap[platform as EDelegateSource];
	const count = sources.length > 1 ? `+${sources.length - 1}` : null;
	const label = platform === 'na' ? 'Individual' : platform.charAt(0).toUpperCase() + platform.slice(1);

	return (
		<div className='flex items-center gap-1'>
			{Logo &&
				(typeof Logo === 'object' && 'src' in Logo ? (
					<Image
						src={Logo}
						alt={platform}
						className='h-3 w-3'
						width={12}
						height={12}
					/>
				) : (
					Logo
				))}
			<span className='text-[10px] sm:text-xs'>
				{label} {count && <span className='ml-0.5'>{count}</span>}
			</span>
		</div>
	);
};

interface DelegateProfileInfoProps {
	delegate: IDelegateDetails;
	publicUser?: IPublicUser;
	identity: IOnChainIdentity | null;
	isFollowing: boolean;
	followersCount: number;
	followingCount: number;
	isFetchingFollowers: boolean;
	isFetchingFollowing: boolean;
	isIdentityFetching: boolean;
	onFollow: () => void;
	onUnfollow: () => void;
}

function DelegateProfileInfo({
	delegate,
	publicUser,
	identity,
	isFollowing,
	followersCount,
	followingCount,
	isFetchingFollowers,
	isFetchingFollowing,
	isIdentityFetching,
	onFollow,
	onUnfollow
}: DelegateProfileInfoProps) {
	const t = useTranslations();
	const { user } = useUser();
	const pathname = usePathname();
	const [openDelegateDialog, setOpenDelegateDialog] = useState(false);

	const delegateCtaTitle = t('Delegation.delegate');

	const mainJudgement = identity?.judgements?.[0]?.[1];
	const displayJudgement = mainJudgement ? (typeof mainJudgement === 'object' ? Object.keys(mainJudgement)[0] : String(mainJudgement)) : t('Profile.noJudgements');

	const creationDate = delegate.createdAt || publicUser?.createdAt;

	return (
		<>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<Address
						disableTooltip
						address={delegate.address}
						iconSize={30}
						showIdenticon
						textClassName='text-left max-w-20 md:max-w-full text-lg font-semibold'
					/>
				</div>
				<div className='flex items-center gap-x-2'>
					{publicUser?.id && user?.id && user.id !== publicUser.id && (
						<Button
							size='sm'
							variant='link'
							leftIcon={
								isFollowing ? (
									<ShieldMinusIcon />
								) : (
									<Image
										src={ShieldPlusIcon}
										alt='follow'
										className='h-4 w-4'
									/>
								)
							}
							className='w-full rounded-3xl px-0 font-medium text-text_pink sm:w-auto'
							onClick={isFollowing ? onUnfollow : onFollow}
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

			<div className='flex flex-wrap items-center justify-between gap-4'>
				<div className='flex items-center gap-x-2'>
					<CopyToClipboard
						label={shortenAddress(delegate.address, 5)}
						text={delegate.address}
						className='text-base font-medium'
					/>
					<div className={`flex items-center gap-1 rounded-md border px-1 py-[2px] ${getPlatformCardStyle(delegate.sources)}`}>{renderSourceTag(delegate.sources)}</div>
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
					{isIdentityFetching ? (
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
					{t('Profile.following')}: {isFetchingFollowing ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{followingCount || 0}</span>}
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}: {isFetchingFollowers ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{followersCount || 0}</span>}
				</div>
			</div>
		</>
	);
}

export default DelegateProfileInfo;
