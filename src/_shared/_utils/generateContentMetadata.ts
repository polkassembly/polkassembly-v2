// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { ENetwork } from '@/_shared/types';
import { generateMetadata } from './generateMetadata';

interface IGenerateContentMetadataOptions {
	title: string;
	description: string;
	url: string;
	imageAlt: string;
	network: ENetwork;
}

export async function getGeneratedContentMetadata({ title, description, url, imageAlt, network }: IGenerateContentMetadataOptions): Promise<Metadata> {
	return generateMetadata({
		title,
		description,
		url,
		imageAlt,
		network
	});
}
