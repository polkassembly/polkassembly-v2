// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Link from 'next/link';
import { useMemo, memo, useEffect, useState, ReactNode } from 'react';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IOnChainIdentity } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
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

interface LinkWrapperProps {
	href: string | null;
	children: ReactNode;
	redirectToProfile?: boolean;
}

function LinkWrapper({ href, children, redirectToProfile }: LinkWrapperProps) {
	if (!href || !redirectToProfile) return children;

	return (
		<Link
			href={href}
			passHref
		>
			{children}
		</Link>
	);
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

	const encodedAddress = useMemo(() => getEncodedAddress(address, network) || address, [address, network]);
	const [displayText, setDisplayText] = useState<string>(walletAddressName || '');
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);

	const linkHref = useMemo(() => {
		if (!network) return null;
		const username = identity?.display;
		return username ? `/${network}/user/${username}` : address ? `/${network}/address/${address}` : null;
	}, [network, address, identity]);

	useEffect(() => {
		const initializeIdentity = async () => {
			setDisplayText(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));

			try {
				const identityInfo = await getOnChainIdentity(encodedAddress);
				if (identityInfo) {
					setIdentity(identityInfo);
					if (identityInfo?.display) {
						setDisplayText(identityInfo?.display);
					}
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			}
		};

		initializeIdentity();
	}, [encodedAddress, getOnChainIdentity, truncateCharLen, walletAddressName]);

	const addressInlineComponent = (
		<AddressInline
			className={className}
			address={encodedAddress}
			onChainIdentity={identity as IOnChainIdentity}
			addressDisplayText={displayText}
			iconSize={iconSize}
			showIdenticon={showIdenticon}
			textClassName={textClassName}
			redirectToProfile={redirectToProfile}
		/>
	);

	if (disableTooltip) {
		return (
			<LinkWrapper
				href={linkHref}
				redirectToProfile={redirectToProfile}
			>
				{addressInlineComponent}
			</LinkWrapper>
		);
	}

	return (
		<div className={classes.tooltipWrapper}>
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='relative cursor-pointer'>
							<LinkWrapper
								href={linkHref}
								redirectToProfile={redirectToProfile}
							>
								{addressInlineComponent}
							</LinkWrapper>
						</div>
					</TooltipTrigger>
					<TooltipContent className={`${classes.tooltipContent} w-[340px] bg-address_tooltip_bg`}>
						<AddressTooltipContent
							address={encodedAddress}
							userProfileUrl={linkHref || ''}
							displayText={displayText}
							identity={identity as IOnChainIdentity}
						/>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

export default memo(Address);
