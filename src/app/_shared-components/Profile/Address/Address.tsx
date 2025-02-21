// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { CopyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dayjs } from '@shared/_utils/dayjsInit';
import AddressInline from './AddressInline/AddressInline';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../Tooltip';
import classes from './AddressInline/AddressInline.module.scss';

interface Props {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
	walletAddressName?: string;
	textClassName?: string;
}

function Address({ className, address, truncateCharLen = 5, iconSize = 20, showIdenticon = true, walletAddressName, textClassName }: Props) {
	const network = getCurrentNetwork();
	const { getOnChainIdentity } = useIdentityService();
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);
	const [userData, setUserData] = useState<IPublicUser | null>(null);
	const [following, setFollowing] = useState<number>(0);
	const [followers, setFollowers] = useState<number>(0);

	const encodedAddress = getEncodedAddress(address, network) || address;
	const [displayText, setDisplayText] = useState<string>(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));

	const fetchUserData = async () => {
		const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address: encodedAddress });
		setUserData(data);
		if (data?.id) {
			const { data: followingData } = await UserProfileClientService.getFollowing({ userId: data?.id });
			const { data: followersData } = await UserProfileClientService.getFollowers({ userId: data?.id });
			setFollowing(followingData?.following?.length || 0);
			setFollowers(followersData?.followers?.length || 0);
		}
	};

	const fetchIdentity = async () => {
		setDisplayText(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));
		try {
			const identityInfo = await getOnChainIdentity(encodedAddress);
			setIdentity(identityInfo);
			if (identityInfo?.display) {
				setDisplayText(identityInfo?.display);
			}
		} catch (error) {
			console.error('Error fetching identity:', error);
		}
	};
	useEffect(() => {
		fetchIdentity();
		fetchUserData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [encodedAddress, network, getOnChainIdentity]);

	const getUserRedirection = (username: string, address: string) => {
		if (!network) return null;
		if (username?.length) {
			return `https://${network}.polkassembly.io/user/${username}`;
		}
		if (address?.length) {
			return `https://${network}.polkassembly.io/address/${address}`;
		}
		return null;
	};

	const copyToClipboard = (address: string) => {
		navigator.clipboard.writeText(address);
	};

	return (
		<div>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div>
							<AddressInline
								className={className}
								address={encodedAddress}
								onChainIdentity={identity as IOnChainIdentity}
								addressDisplayText={displayText}
								iconSize={iconSize}
								showIdenticon={showIdenticon}
								textClassName={textClassName}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent className={classes.tooltipContent}>
						{userData && (
							<div
								aria-hidden='true'
								className='flex flex-col gap-1.5 border-solid pb-2 dark:border-none'
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								<div className='flex flex-col gap-1.5 px-4'>
									<img
										src={userData.profileDetails.image || '/assets/profile/default-profile.png'}
										alt='User'
										className='-mt-[50px] flex h-[98px] w-[98px] rounded-full border-[2px] border-solid border-white bg-white dark:border-none dark:border-[#3B444F]'
									/>
									<div className={`flex ${!address && !userData.createdAt ? 'mb-2 justify-between' : 'flex-col gap-1.5'}`}>
										<div className='mt-0 flex items-center justify-start gap-2'>
											<span className='text-bodyBlue dark:text-blue-dark-high text-xl font-semibold tracking-wide'>
												{userData?.username?.length > 15 ? `${userData?.username?.slice(0, 15)}...` : userData?.username}
											</span>
											{/* <div className='flex items-center justify-center'>{isGood ? <VerifiedIcon className='text-xl' /> : <MinusCircleFilled style={{ color }} />}</div> */}
											<button
												type='button'
												className='text-pink_primary flex'
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													window.open(getUserRedirection(userData?.username || '', address) || '', '_blank');
												}}
											>
												{/* <ShareScreenIcon /> */}
											</button>
										</div>
										<div className={`flex gap-1.5 ${userData.createdAt || !!(identity as IOnChainIdentity)?.parentProxyTitle?.length ? 'flex-col' : 'justify-between'}`}>
											{!!address && (
												<div className='text-bodyBlue dark:text-blue-dark-high flex items-center gap-1 text-xs'>
													<Address
														address={address}
														iconSize={20}
														truncateCharLen={5}
													/>
													<span
														className='flex cursor-pointer items-center'
														aria-hidden='true'
														onClick={(e) => {
															e.preventDefault();
															copyToClipboard(address);
														}}
													>
														{address}
														<CopyIcon className='text-lightBlue dark:text-icon-dark-inactive -ml-[6px] scale-[70%] text-2xl' />
													</span>
												</div>
											)}

											<div className={cn('mt-0.5 flex items-center gap-1 border-solid dark:border-none', userData.createdAt ? 'justify-between' : 'justify-start')}>
												{!!userData.createdAt && (
													<span className='flex items-center text-xs tracking-wide text-[#9aa7b9] dark:text-[#595959]'>
														Since:<span className='text-lightBlue dark:text-blue-dark-medium ml-0.5'>{dayjs(userData.createdAt).format('MMM DD, YYYY')}</span>
													</span>
												)}

												{!!identity?.judgements && (
													<article className='text-bodyBlue flex items-center justify-center gap-1 text-xs dark:border-[#5A5A5A]'>
														<div className='text-lightBlue flex items-center gap-1 font-medium'>
															{/* <JudgementIcon /> */}
															<span className='text-[#9aa7b9] dark:text-[#595959]'>Judgements:</span>
														</div>
														<span className='text-bodyBlue dark:text-blue-dark-high'>
															{identity?.judgements
																?.map(([, jud]) => jud.toString())
																.join(', ')
																?.split(',')?.[0] || 'None'}
														</span>
													</article>
												)}
											</div>
										</div>
									</div>
									<div className={userData?.id && !isNaN(userData?.id) ? 'flex justify-between' : 'flex justify-start'}>
										{!!userData?.id && !isNaN(userData?.id) && (
											<div>
												<p>Followers: {followers}</p>
												<p>Following: {following}</p>
											</div>
										)}
										{/* <socialNet
											address={address}
											onchainIdentity={identity || null}
											socials={socials || []}
										/> */}
									</div>
								</div>
							</div>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

export default Address;
