// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { Metadata } from 'next';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.CHILD_BOUNTY, indexOrHash: index });
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		network,
		title: `${title} - Child Bounty #${index}`,
		description: data
			? `Bounty #${index}: ${data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : data.title}`
			: 'Explore all Child Bounty Proposals on Polkassembly',
		url: `https://${network}.polkassembly.io/child-bounty/${index}`,
		imageAlt: `Polkassembly Child Bounty #${index}`
	});
}

async function ChildBounty({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.CHILD_BOUNTY, indexOrHash: index });

	if (error || !data) return <div className='text-center text-text_primary'>{error?.message || 'Failed to load proposal'}</div>;

	return (
		<div className='h-full w-full'>
			<PostDetails
				index={index}
				postData={data}
			/>
		</div>
	);
}

export default ChildBounty;
