// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.BOUNTY, indexOrHash: index });

	// Default description and title
	let { description, title } = OPENGRAPH_METADATA;

	// Use post title in description if available
	if (data) {
		title = `Polkassembly - Bounty #${index}`;
		description = `Bounty #${index}: ${data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : data.title}`;
	}

	return {
		title,
		description
	};
}

async function Bounty({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.BOUNTY, indexOrHash: index });

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

export default Bounty;
