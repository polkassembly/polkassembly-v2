// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React from 'react';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { notFound } from 'next/navigation';
import { StatusCodes } from 'http-status-codes';
import ServerComponentError from '@/app/_shared-components/ServerComponentError';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });
	const { title: baseTitle } = OPENGRAPH_METADATA;

	// Default description and title
	return getGeneratedContentMetadata({
		title: `${baseTitle} - ${data?.title} #${index}`,
		description: data
			? `Discussion #${index}: ${data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : data.title}`
			: `Explore Polkassembly Discussion #${index}`,
		network,
		url: `https://${network}.polkassembly.io/post/${index}`,
		imageAlt: 'Polkassembly Post'
	});
}

async function DiscussionPost({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });

	if (error || !data) {
		// Handle 404 errors properly by calling notFound()
		if (error?.status === StatusCodes.NOT_FOUND) {
			notFound();
		}

		// For other errors, show the error message.
		return <ServerComponentError errorMsg={error?.message || 'Failed to load discussion.'} />;
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

export default DiscussionPost;
