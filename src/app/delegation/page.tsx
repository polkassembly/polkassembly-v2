// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Delegation from './Components/Delegation';
import { NextApiClientService } from '../_client-services/next_api_client_service';

async function DelegationPage() {
	const { data: delegationStats } = await NextApiClientService.getDelegateStats();

	return (
		<Delegation
			delegationStats={
				delegationStats ?? {
					totalDelegatedTokens: '0',
					totalDelegatedVotes: 0,
					totalDelegates: 0,
					totalDelegators: 0
				}
			}
		/>
	);
}

export default DelegationPage;
