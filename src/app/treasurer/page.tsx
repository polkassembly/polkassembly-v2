// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostOrigin, EProposalType } from '@/_shared/types';
import dynamic from 'next/dynamic';

const ListingPage = dynamic(() => import('../_shared-components/ListingComponent/ListingPage/ListingPage'), { ssr: false });

function Page() {
	return (
		<div>
			<ListingPage
				title='Treasurer'
				description='A space to share insights, provide feedback, and collaborate on ideas that impact the network.'
				proposalType={EProposalType.REFERENDUM_V2}
				origins={EPostOrigin.TREASURER}
			/>
		</div>
	);
}

export default Page;
