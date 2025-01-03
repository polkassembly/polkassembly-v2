// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Auction Admin'
				description='Origin for starting auctions.'
				proposalType={EProposalType.REFERENDUM_V2}
				origins={[EPostOrigin.AUCTION_ADMIN]}
			/>
		</div>
	);
}

export default Page;
