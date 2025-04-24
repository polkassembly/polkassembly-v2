// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo, memo, useEffect, useState } from 'react';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { useQuery } from '@tanstack/react-query';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useIdentityService } from '@/hooks/useIdentityService';
import AddressInline from './AddressInline/AddressInline';
import classes from './AddressInline/AddressInline.module.scss';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../Tooltip';
import AddressTooltipContent from './AddressTooltipContent';

interface AddressProps {
	userId?: number;
	className?: string;
	address?: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
	walletAddressName?: string;
	textClassName?: string;
	redirectToProfile?: boolean;
	disableTooltip?: boolean;
}

function Address({
	userId,
	className,
	address,
	truncateCharLen = 5,
	iconSize = 20,
	showIdenticon = true,
	walletAddressName,
	textClassName,
	redirectToProfile,
	disableTooltip = false
}: AddressProps) {
	const network = getCurrentNetwork();
	const { getOnChainIdentity } = useIdentityService();

	const queryOptions = useMemo(
		() => ({
			staleTime: 5 * 60 * 1000,
			enabled: true
		}),
		[]
	);
	const { data: userData, isLoading: isUserDataLoading } = useQuery<IPublicUser | null>({
		queryKey: ['userData', address],
		queryFn: async () => {
			if (!address && !userId) return null;
			if (address) {
				const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address });
				return data ?? null;
			}
			if (userId) {
				const { data } = await UserProfileClientService.fetchPublicUserById({ userId });
				return data ?? null;
			}
			return null;
		},
		...queryOptions
	});

	const encodedAddress = useMemo(() => (address && getEncodedAddress(address, network)) || address, [address, network]);
	const [displayText, setDisplayText] = useState<string>(walletAddressName || '');
	const [identity, setIdentity] = useState<IOnChainIdentity | undefined>();

	const userProfileUrl = useMemo(() => {
		if (!network || isUserDataLoading) return undefined;
		const username = userData?.username;
		return username && username.length > 0 ? `/user/username/${username}` : address && address.length > 0 ? `/user/address/${address}` : userId ? `/user/id/${userId}` : undefined;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, address, userData, userId]);

	useEffect(() => {
		const initializeIdentity = async () => {
			if (!encodedAddress) return;
			setDisplayText(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));

			try {
				const identityInfo = await getOnChainIdentity(encodedAddress);
				if (identityInfo) {
					setIdentity(identityInfo);
					if (identityInfo?.display) {
						setDisplayText(identityInfo.display);
					}
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			}
		};

		initializeIdentity();
	}, [encodedAddress, getOnChainIdentity, truncateCharLen, walletAddressName]);

	if (disableTooltip) {
		return (
			<AddressInline
				className={className}
				address={encodedAddress}
				onChainIdentity={identity}
				addressDisplayText={displayText || userData?.username}
				userProfileUrl={userProfileUrl}
				iconSize={iconSize}
				showIdenticon={showIdenticon}
				textClassName={textClassName}
				redirectToProfile={redirectToProfile}
			/>
		);
	}

	return (
		<div className={classes.tooltipWrapper}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='relative cursor-pointer'>
							<AddressInline
								className={className}
								address={encodedAddress}
								onChainIdentity={identity}
								userProfileUrl={userProfileUrl}
								addressDisplayText={displayText || userData?.username}
								iconSize={iconSize}
								showIdenticon={showIdenticon}
								textClassName={textClassName}
								redirectToProfile={redirectToProfile}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent className={`${classes.tooltipContent} w-[340px] bg-address_tooltip_bg`}>
						<AddressTooltipContent
							address={encodedAddress}
							userProfileUrl={userProfileUrl}
							displayText={displayText}
							identity={identity}
							userData={userData ?? undefined}
							isUserDataLoading={isUserDataLoading}
						/>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

export default memo(Address);
