// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IOnChainIdentity } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import AddressInline from './AddressInline/AddressInline';

interface Props {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
}

function Address({ className, address, truncateCharLen = 5, iconSize = 20, showIdenticon = true }: Props) {
	const network = getCurrentNetwork();
	const { getOnChainIdentity } = useIdentityService();
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);

	const encodedAddress = getEncodedAddress(address, network) || address;

	const fetchIdentity = async () => {
		try {
			const identityInfo = await getOnChainIdentity(encodedAddress);
			setIdentity(identityInfo);
		} catch {
			// console.error('Error fetching identity:', error);
		}
	};

	useEffect(() => {
		fetchIdentity();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [encodedAddress, network]);

	const displayText = identity?.display || shortenAddress(encodedAddress, truncateCharLen);

	return (
		<div>
			<AddressInline
				className={className}
				address={encodedAddress}
				onChainIdentity={identity as IOnChainIdentity}
				addressDisplayText={displayText}
				iconSize={iconSize}
				showIdenticon={showIdenticon}
			/>
		</div>
	);
}

export default Address;
