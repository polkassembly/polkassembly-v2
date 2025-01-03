// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Onchain Referenda'
				description='This is the place to discuss on-chain referenda. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able to edit them.'
				proposalType={EProposalType.REFERENDUM}
			/>
		</div>
	);
}

export default Page;
