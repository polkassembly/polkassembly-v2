// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ProfileAvatar from '@assets/profile/user-icon.svg';
import { cn } from '@/lib/utils';
import { dayjs } from '@shared/_utils/dayjsInit';
import Identicon from '@polkadot/react-identicon';
import { CopyIcon, ShieldPlus } from 'lucide-react';
import { IOnChainIdentity, IPublicUser } from '@/_shared/types';
import AddressInline from './AddressInline/AddressInline';
import SocialLinks from './SocialLinks';
import classes from './AddressInline/AddressInline.module.scss';
import { Button } from '../../Button';

interface AddressTooltipContentProps {
	address: string;
	userData?: IPublicUser;
	identity?: IOnChainIdentity;
	followers: number;
	following: number;
	isFollowing: boolean;
	redirectionUrl: string | null;
	onCopy: (address: string) => void;
	onFollow: () => void;
	onUnfollow: () => void;
	loading: boolean;
	displayText: string;
}

const ProfileImage = React.memo(({ imageUrl }: { imageUrl?: string }) => (
	<div className={classes.profileImageContainer}>
		<Image
			src={imageUrl || ProfileAvatar}
			alt='User'
			className={classes.profileImage}
			width={98}
			height={98}
			priority
		/>
	</div>
));

const UserStats = React.memo(({ followers, following }: { followers: number; following: number }) => (
	<div className='flex gap-1.5'>
		<p className='whitespace-nowrap text-text_primary'>
			Followers: <span className='text-text_pink'>{followers}</span>
		</p>

		<p className='whitespace-nowrap border-l border-border_grey pl-2 text-text_primary'>
			Following: <span className='text-text_pink'>{following}</span>
		</p>
	</div>
));

const AddressTooltipContent = React.memo(
	({ address, userData, identity, followers, following, isFollowing, redirectionUrl, onCopy, onFollow, onUnfollow, loading, displayText }: AddressTooltipContentProps) => {
		const t = useTranslations();

		return (
			<div>
				{userData ? (
					<>
						<ProfileImage imageUrl={userData.profileDetails?.image} />
						<div className={classes.tooltipContentWrapper}>
							<div
								aria-hidden='true'
								className='relative flex flex-col gap-1.5 border-solid pb-2 dark:border-none'
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								<div className='flex flex-col gap-1.5 px-2'>
									<div className={cn('mb-2 flex justify-between gap-1.5')}>
										<div className='flex w-full flex-col gap-1.5'>
											<div className='mt-0 flex items-center justify-start gap-2'>
												<div
													aria-hidden
													className='text-pink_primary flex cursor-pointer'
													onClick={() => redirectionUrl && window.open(redirectionUrl, '_blank')}
												>
													<AddressInline
														address={address}
														showIdenticon={false}
														className='text-lg'
														onChainIdentity={identity}
														addressDisplayText={displayText}
													/>
												</div>
											</div>
											<div className='flex w-full flex-col gap-1.5'>
												<div className='flex items-center gap-1 text-xs text-text_primary'>
													<span
														className='flex cursor-pointer items-center gap-2'
														onClick={() => onCopy(address)}
														aria-hidden
													>
														<Identicon
															className='image identicon'
															value={address}
															size={20}
															theme='polkadot'
														/>
														<span>{address.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address}</span>
														<CopyIcon className='-ml-[6px] scale-[70%] text-2xl' />
													</span>
												</div>
												<div className='mt-0.5 flex items-center justify-between gap-1 border-solid px-2 dark:border-none'>
													{userData.createdAt && (
														<span className='flex items-center text-xs tracking-wide text-address_tooltip_text'>
															Since: <span className='ml-0.5 text-text_primary'>{dayjs(userData.createdAt).format('MMM DD, YYYY')}</span>
														</span>
													)}
													{identity?.judgements && (
														<article className='flex items-center justify-center gap-1 text-xs'>
															<div className='flex items-center gap-1 font-medium text-text_primary'>
																<span className='text-address_tooltip_text'>Judgements:</span>
															</div>
															<span className='text-wallet_btn_text'>
																{identity.judgements
																	.map(([, jud]) => jud.toString())
																	.join(', ')
																	.split(',')[0] || 'None'}
															</span>
														</article>
													)}
												</div>
											</div>
										</div>
									</div>
									<div className={cn(userData.id && !isNaN(userData.id) ? 'flex items-center justify-between px-2' : 'flex items-center justify-start')}>
										{userData.id && !isNaN(userData.id) && (
											<UserStats
												followers={followers}
												following={following}
											/>
										)}
										<SocialLinks
											identity={identity ?? undefined}
											socialLinks={userData.profileDetails?.publicSocialLinks || []}
										/>
									</div>
									<Button
										size='lg'
										className='mt-2 rounded-3xl'
										leftIcon={<ShieldPlus />}
										isLoading={loading}
										onClick={isFollowing ? onUnfollow : onFollow}
										disabled={!userData.id}
									>
										{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
									</Button>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<ProfileImage />
						<div className={classes.tooltipContentWrapper}>
							<div
								aria-hidden='true'
								className='relative flex flex-col gap-1.5 border-solid pb-2 dark:border-none'
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								<div className='flex flex-col gap-1.5 px-4'>
									<div className='mt-0 flex items-center justify-start gap-2'>
										<div
											aria-hidden
											className='text-pink_primary flex cursor-pointer'
											onClick={() => redirectionUrl && window.open(redirectionUrl, '_blank')}
										>
											<AddressInline
												address={address}
												showIdenticon={false}
												className='text-lg'
												onChainIdentity={identity}
												addressDisplayText={displayText}
											/>
										</div>
									</div>
									<div className='flex justify-between gap-1.5'>
										<div className='flex items-center gap-1 text-xs text-text_primary'>
											<span
												aria-hidden
												className='flex cursor-pointer items-center gap-2'
												onClick={() => onCopy(address)}
											>
												<Identicon
													className='image identicon'
													value={address}
													size={20}
													theme='polkadot'
												/>
												<span>{address.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address}</span>
												<CopyIcon className='-ml-[6px] scale-[70%] text-2xl' />
											</span>
										</div>
										<div className='flex items-center justify-start'>
											<UserStats
												followers={followers}
												following={following}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		);
	}
);

export default AddressTooltipContent;
