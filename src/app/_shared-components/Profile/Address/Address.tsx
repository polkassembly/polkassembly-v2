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
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import AddressInline from './AddressInline/AddressInline';
import classes from './AddressInline/AddressInline.module.scss';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../Tooltip';
import AddressTooltipContent from './AddressTooltipContent';

interface AddressProps {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
	walletAddressName?: string;
	textClassName?: string;
	redirectToProfile?: boolean;
	disableTooltip?: boolean;
}

function Address({
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

	const { data: userData, isLoading: isUserDataLoading } = useQuery<IPublicUser | null>({
		queryKey: ['userData', address],
		queryFn: async () => {
			const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address });
			return data ?? null;
		},
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!address,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	const encodedAddress = useMemo(() => (address && getEncodedAddress(address, network)) || address, [address, network]);
	const [displayText, setDisplayText] = useState<string>(walletAddressName || '');
	const [identity, setIdentity] = useState<IOnChainIdentity | undefined>();

	const userProfileUrl = useMemo(() => {
		if (!network || isUserDataLoading) return undefined;
		const username = userData?.username;
		return address && address.length > 0 ? `/user/address/${address}` : username && username.length > 0 ? `/user/username/${username}` : undefined;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, address, userData]);

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
			} catch {
				// console.error('Error fetching identity:', error);
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
				addressDisplayText={displayText}
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
								addressDisplayText={displayText}
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
