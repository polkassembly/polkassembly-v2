// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import getEncodedAddress from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import AddressInline from './AddressInline';

interface Props {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
}

function Address({ className, address, truncateCharLen, iconSize = 20 }: Props) {
	const network = getCurrentNetwork();

	const encodedAddress = getEncodedAddress(address, network) || address;
	const onChainUsername = 'vm';
	const addressDisplayText = truncateCharLen ? shortenAddress(encodedAddress) : encodedAddress;

	const truncatedUsername = truncateCharLen ? shortenAddress(onChainUsername, truncateCharLen) : onChainUsername;
	return (
		<div>
			<AddressInline
				className={className}
				address={encodedAddress}
				addressDisplayText={truncatedUsername || addressDisplayText}
				iconSize={iconSize}
			/>
		</div>
	);
}

export default Address;
