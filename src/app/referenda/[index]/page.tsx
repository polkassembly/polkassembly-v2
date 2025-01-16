// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CookieService } from '@/_shared/_services/cookie_service';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React from 'react';

async function Referenda({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetailsApi(EProposalType.REFERENDUM_V2, index);

	const user = await CookieService.getUserFromCookie();

	if (error || !data) return <div className='text-center text-text_primary'>{error?.message}</div>;

	return (
		<div className='h-full w-full bg-page_background'>
			<PostDetails
				index={index}
				postData={data}
				user={user}
			/>
		</div>
	);
}

export default Referenda;
