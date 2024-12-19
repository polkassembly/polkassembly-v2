// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType } from '@/_shared/types';
import dynamic from 'next/dynamic';

const ListingPage = dynamic(() => import('../_shared-components/ListingComponent/ListingPage/ListingPage'), { ssr: false });

function Page() {
	return (
		<div>
			<ListingPage proposalType={EProposalType.REFERENDUM_V2} />
		</div>
	);
}

export default Page;
