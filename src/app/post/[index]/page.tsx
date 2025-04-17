// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React from 'react';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });

	// Default description and title
	let { description, title } = OPENGRAPH_METADATA;

	// Use post title in description if available
	if (data) {
		title = `Polkassembly - Discussion #${index}`;
		description = `Discussion #${index}: ${data.contentSummary?.postSummary ? data.contentSummary.postSummary : data.title}`;
	}

	return {
		title,
		description
	};
}

async function DiscussionPost({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });

	if (error || !data) throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);

	return (
		<div className='h-full w-full bg-page_background'>
			<PostDetails
				index={index}
				postData={data}
			/>
		</div>
	);
}

export default DiscussionPost;
