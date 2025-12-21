// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import JudgementTabs from './Components/JudgementTabs/JudgementTabs';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Judgements`,
		description: 'Explore Polkassembly Judgements',
		network,
		url: `https://${network}.polkassembly.io/judgements`,
		imageAlt: 'Polkassembly Judgements'
	});
}
async function Judgements() {
	return <JudgementTabs />;
}

export default Judgements;
