// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusCodes } from 'http-status-codes';
import ServerComponentError from '@/app/_shared-components/ServerComponentError';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.BOUNTY, indexOrHash: index });

	return getGeneratedContentMetadata({
		description: data
			? `Bounty #${index}: ${data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : data.title}`
			: 'Explore all Bounty Proposals on Polkassembly',
		imageAlt: 'Polkassembly Bounty',
		title: `Polkassembly - Bounty #${index}`,
		url: `https://${network}.polkassembly.io/bounty/${index}`,
		network
	});
}

async function Bounty({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.BOUNTY, indexOrHash: index });

	if (error || !data) {
		// Handle 404 errors properly by calling notFound()
		if (error?.status === StatusCodes.NOT_FOUND) {
			notFound();
		}

		// For other errors, show the error message.
		return <ServerComponentError errorMsg={error?.message || 'Failed to load bounty.'} />;
	}

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
