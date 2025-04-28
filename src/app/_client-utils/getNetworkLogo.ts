// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import { StaticImageData } from 'next/image';
import { NETWORKS_DISPLAY_DATA } from '@/_shared/_constants/networksDisplayData';

const defaultLogo = WestendLogo;

export const getNetworkLogo = (networkKey: string): StaticImageData => {
	const lowerNetworkKey = networkKey.toLowerCase();
	return (
		Object.values(NETWORKS_DISPLAY_DATA)
			.flatMap((category) => Object.entries(category) as [string, StaticImageData][])
			.find(([key]) => key.toLowerCase() === lowerNetworkKey)?.[1] || defaultLogo
	);
};
