// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import PollForProposal from '@/app/_shared-components/PollForProposal';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { markdownToPlainText } from '@/_shared/_utils/markdownToText';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { notFound } from 'next/navigation';
import { StatusCodes } from 'http-status-codes';
import ServerComponentError from '@/app/_shared-components/ServerComponentError';

export async function generateMetadata({ params }: { params: Promise<{ index: string }> }): Promise<Metadata> {
	const { index } = await params;

	const network = await getNetworkFromHeaders();
	const { data } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.REFERENDUM_V2, indexOrHash: index });

	return getGeneratedContentMetadata({
		title: `Polkassembly - Referendum #${index}`,
		description: data
			? [data.title, data.contentSummary?.postSummary ? markdownToPlainText(data.contentSummary.postSummary) : ''].filter(Boolean).join(' - ').trim() ||
				`Referendum #${index} on Polkassembly`
			: `Explore Polkassembly Referendum #${index}`,
		network,
		url: `https://${network}.polkassembly.io/referenda/${index}`,
		imageAlt: `Polkassembly Referendum #${index}`
	});
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

	if (error || !data) {
		// Handle 404 errors properly by calling notFound()
		if (error?.status === StatusCodes.NOT_FOUND) {
			notFound();
		}

		// For other errors, show the error message.
		return <ServerComponentError errorMsg={error?.message || 'Failed to load referendum.'} />;
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

export default Referenda;
