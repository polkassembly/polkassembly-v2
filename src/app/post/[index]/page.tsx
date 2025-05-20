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
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;
	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });
	const { title: baseTitle, description: baseDescription } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	// Default description and title
	const title = `${baseTitle} - Discussion #${index}`;
	let description = baseDescription;

	// Use post title in description if available
	if (data) {
		description = `Discussion #${index}: ${data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : data.title}`;
	}

	const url = `https://${network}.polkassembly.io/post/${index}`;

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
					alt: 'Polkassembly Discussion'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Discussion'
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

async function DiscussionPost({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: index });

	if (error || !data) throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);

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
