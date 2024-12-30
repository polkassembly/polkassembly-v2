// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Members'
				description='Open Tech Committee Members is a mostly self-governing expert body with a primary goal of representing the humans who embody and contain the technical knowledge base of the Polkadot network and protocol.'
				proposalType={EProposalType.REFERENDUM_V2}
				origins={[EPostOrigin.MEMBERS]}
			/>
		</div>
	);
}

export default Page;
