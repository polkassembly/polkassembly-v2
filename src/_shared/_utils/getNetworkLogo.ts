// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import { StaticImageData } from 'next/image';
import { networkData } from './getNetworkData';

const defaultLogo = WestendLogo;

export const getNetworkLogo = (networkKey: string): StaticImageData => {
	const lowerNetworkKey = networkKey.toLowerCase();
	return (
		Object.values(networkData)
			.flatMap((category) => Object.entries(category))
			.find(([key]) => key.toLowerCase() === lowerNetworkKey)?.[1] || defaultLogo
	);
};
