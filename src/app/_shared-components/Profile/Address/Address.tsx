// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import getEncodedAddress from '@/_shared/_utils/getEncodedAddress';
import midTruncateText from '@/_shared/_utils/midTruncateText';
import { ENetwork } from '@/_shared/types';
import LinkWithNetwork from '../../Misc/LinkWithNetwork';
import AddressInline from './AddressInline';

interface Props {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
}

function Address({ className, address, truncateCharLen, iconSize = 20 }: Props) {
	const network = ENetwork.POLKADOT;

	const encodedAddress = getEncodedAddress(address, network) || address;
	const onChainUsername = 'vm';
	const addressDisplayText = truncateCharLen
		? midTruncateText({
				text: encodedAddress,
				startChars: truncateCharLen,
				endChars: truncateCharLen
			})
		: encodedAddress;

	const truncatedUsername = truncateCharLen
		? midTruncateText({
				text: onChainUsername,
				startChars: 10,
				endChars: 10
			})
		: onChainUsername;

	return (
		<LinkWithNetwork>
			<AddressInline
				className={className}
				address={encodedAddress}
				addressDisplayText={truncatedUsername || addressDisplayText}
				iconSize={iconSize}
			/>
		</LinkWithNetwork>
	);
}

export default Address;
