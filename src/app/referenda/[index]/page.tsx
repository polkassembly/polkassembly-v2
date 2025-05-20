// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import PollForProposal from '@/app/_shared-components/PollForProposal';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;

	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.REFERENDUM_V2, indexOrHash: index });

	// Default description and title
	let { description, title } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	// Use post title in description if available
	if (data) {
		title = `Polkassembly - Referendum #${index}`;
		description = `Referendum #${index}: ${data.contentSummary?.postSummary ? data.contentSummary.postSummary : data.title}`;
	}

	const url = `https://polkassembly.com/referenda/${index}`;

	return {
		title,
		description,
		metadataBase: new URL('https://polkassembly.com'),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: `Polkassembly Referendum #${index}`
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: `Polkassembly Referendum #${index}`
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
			images: image ? [image] : [],
			site: '@polkassembly'
		}
	};
}

async function Referenda({ params, searchParams }: { params: Promise<{ index: string }>; searchParams: Promise<{ created?: string }> }) {
	const { index } = await params;
	const { created } = await searchParams;

	const headersList = await headers();
	const referer = headersList.get('referer');

	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.REFERENDUM_V2, indexOrHash: index });

	// If created=true and no data, we'll poll on the client side
	if (created && created === 'true' && (!data || error)) {
		return (
			<Suspense fallback={<div className='flex h-screen items-center justify-center'>Loading...</div>}>
				<PollForProposal
					index={index}
					referer={referer}
					proposalType={EProposalType.REFERENDUM_V2}
				/>
			</Suspense>
		);
	}

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

export default Referenda;
