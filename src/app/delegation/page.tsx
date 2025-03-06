// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Delegation from './Components/index';
import { NextApiClientService } from '../_client-services/next_api_client_service';

async function DelegationPage() {
	const { data: delegationStats } = await NextApiClientService.getDelegationStats();
	const { data: delegates } = await NextApiClientService.getDelegates();

	return (
		<div className='grid grid-cols-1 gap-5 p-5 lg:p-10'>
			<Delegation
				delegationStats={
					delegationStats ?? {
						totalDelegatedBalance: '0',
						totalDelegatedVotes: { totalCount: 0 },
						totalDelegates: 0,
						totalDelegators: 0
					}
				}
				delegates={delegates?.delegates ?? []}
			/>
		</div>
	);
}

export default DelegationPage;
