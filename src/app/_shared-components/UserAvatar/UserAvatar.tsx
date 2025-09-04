// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import Link from 'next/link';
import UserIcon from '@assets/profile/user-icon.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Address from '../Profile/Address/Address';

function UserAvatar({
	publicUser,
	textClassName,
	showIdenticon = true,
	iconSize = 20,
	disableTooltip = false,
	redirectToProfile = true,
	onAddressSelection
}: {
	publicUser?: IPublicUser;
	textClassName?: string;
	showIdenticon?: boolean;
	iconSize?: number;
	disableTooltip?: boolean;
	redirectToProfile?: boolean;
	onAddressSelection?: (address: string) => void;
}) {
	const { identityService, getOnChainIdentity } = useIdentityService();
	const [imageError, setImageError] = useState(false);

	const fetchIdentity = async (): Promise<{ identity?: IOnChainIdentity; displayAddress?: string }> => {
		if (!publicUser?.addresses.length) return { identity: undefined, displayAddress: undefined };

		const identities: (IOnChainIdentity & { address: string })[] = [];
		// eslint-disable-next-line no-restricted-syntax
		for (const addr of publicUser.addresses) {
			// eslint-disable-next-line no-await-in-loop
			const identityLocal = await getOnChainIdentity(addr);
			if (identityLocal && identityLocal.isVerified) {
				onAddressSelection?.(addr);
				return { identity: identityLocal, displayAddress: addr };
			}
			if (identityLocal && identityLocal.display) {
				identities.push({ ...identityLocal, address: addr });
			}
		}
		if (identities.length > 0) {
			onAddressSelection?.(identities[0].address);
			return { identity: identities[0], displayAddress: identities[0].address };
		}

		return { identity: undefined, displayAddress: undefined };
	};

	const {
		data: { displayAddress }
	} = useQuery({
		queryKey: ['profile-display', publicUser?.id],
		initialData: { identity: undefined, displayAddress: undefined },
		queryFn: fetchIdentity,
		enabled: !!identityService && !!publicUser?.addresses.length
	});

	const imgSrc = publicUser?.profileDetails?.image;
	const isImgSrcValid = imgSrc && ValidatorService.isValidImageSrc(imgSrc);

	return (
		<div>
			{displayAddress ? (
				<Address
					textClassName={textClassName}
					address={displayAddress}
					showIdenticon={showIdenticon}
					iconSize={iconSize}
					disableTooltip={disableTooltip}
					redirectToProfile={redirectToProfile}
				/>
			) : publicUser?.username ? (
				<div className='flex items-center gap-x-1.5'>
					{showIdenticon && (
						<Image
							src={imageError || !isImgSrcValid ? UserIcon : imgSrc}
							alt='user'
							width={iconSize}
							height={iconSize}
							style={{ width: iconSize, height: iconSize }}
							className='rounded-full'
							unoptimized={!!isImgSrcValid}
							onError={() => {
								setImageError(true);
							}}
						/>
					)}
					{redirectToProfile ? (
						<Link
							className={cn('truncate text-xs font-bold text-text_primary lg:text-sm', textClassName)}
							href={`/user/${publicUser.username}`}
						>
							{publicUser.username}
						</Link>
					) : (
						<p className={cn('truncate text-xs font-bold text-text_primary lg:text-sm', textClassName)}>{publicUser.username}</p>
					)}
				</div>
			) : null}
		</div>
	);
}

export default UserAvatar;
