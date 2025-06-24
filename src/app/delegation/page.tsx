// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Metadata } from 'next';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { ClientError } from '../_client-utils/clientError';
import Delegation from './Components/Delegation';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Delegation`,
		description: 'Track your delegation on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/delegation`,
		imageAlt: 'Polkassembly Delegation'
	});
}

async function DelegationPage() {
	const { data: delegationStats, error } = await NextApiClientService.getDelegateStats();

	if (error || !delegationStats) throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);

	return <Delegation delegationStats={delegationStats} />;
}

export default DelegationPage;
