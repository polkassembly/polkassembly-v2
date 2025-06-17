// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '../types';

interface GenerateMetadataOptions {
	title: string;
	description: string;
	url: string;
	imageAlt: string;
	network: ENetwork;
}

export async function generateMetadata({ title, description, url, imageAlt, network }: GenerateMetadataOptions): Promise<Metadata> {
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: imageAlt
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: imageAlt
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}
