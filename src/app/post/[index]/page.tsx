// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import React from 'react';

async function DiscussionPost({ params }: { params: Promise<{ index: string }> }) {
	const { index } = await params;
	const { data, error } = await NextApiClientService.fetchProposalDetailsApi(EProposalType.DISCUSSION, index);

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
