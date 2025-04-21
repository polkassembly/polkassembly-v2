// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, IPost } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React, { useEffect, useState } from 'react';

export default function PollForProposal({ index, referer, proposalType = EProposalType.REFERENDUM_V2 }: { index: string; referer: string | null; proposalType?: EProposalType }) {
	const [data, setData] = useState<IPost>();
	const [error, setError] = useState<string>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let intervalId: any;

		const fetchData = async () => {
			const { origin } = window.location;
			if (!referer || referer !== `${origin}/create`) {
				setError('Post not found');
				return;
			}
			try {
				const { data: postData } = await NextApiClientService.fetchProposalDetails({
					proposalType,
					indexOrHash: index
				});

				if (!isMounted) return;

				if (postData) {
					setData(postData);
					setLoading(false);
					// Clear interval once we get data
					if (intervalId) clearInterval(intervalId);
				}
			} catch (err) {
				if (!isMounted) return;
				console.log(err);
			}
		};

		// Initial fetch
		fetchData();

		// Start polling every 6 seconds
		intervalId = setInterval(fetchData, 6000);

		return () => {
			isMounted = false;
			if (intervalId) clearInterval(intervalId);
		};
	}, [index, referer, proposalType]);

	if (error) {
		return <div className='text-center text-text_primary'>{error}</div>;
	}

	if (loading) {
		return (
			<div className='flex h-screen flex-col items-center justify-center'>
				<div className='border-pink_primary mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2' />
				<p className='text-text_primary'>Loading proposal data...</p>
			</div>
		);
	}

	if (!data) {
		return <div className='text-center text-text_primary'>Failed to load proposal</div>;
	}

	return (
		<div className='h-full w-full bg-page_background'>
			<PostDetails
				index={index}
				postData={data}
			/>
		</div>
	);
}
