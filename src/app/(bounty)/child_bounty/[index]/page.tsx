// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import PollForProposal from '@/app/referenda/[index]/PollForProposal';

async function Referenda({ params, searchParams }: { params: Promise<{ index: string }>; searchParams: Promise<{ created?: string }> }) {
	const { index } = await params;
	const { created } = await searchParams;

	const headersList = await headers();
	const referer = headersList.get('referer');

	const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.CHILD_BOUNTY, indexOrHash: index });

	// If created=true and no data, we'll poll on the client side
	if (created && created === 'true' && (!data || error)) {
		return (
			<Suspense fallback={<div className='flex h-screen items-center justify-center'>Loading...</div>}>
				<PollForProposal
					index={index}
					referer={referer}
				/>
			</Suspense>
		);
	}

	if (error || !data) return <div className='text-center text-text_primary'>{error?.message || 'Failed to load proposal'}</div>;

	return (
		<div className='h-full w-full bg-page_background'>
			<PostDetails
				index={index}
				postData={data}
			/>
		</div>
	);
}

export default Referenda;
