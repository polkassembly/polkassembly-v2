// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Treasurer'
				description='Origin for spending (any amount of) funds until the upper limit of 10,000,000 DOT.'
				proposalType={EProposalType.REFERENDUM_V2}
				origins={[EPostOrigin.TREASURER]}
			/>
		</div>
	);
}

export default Page;
