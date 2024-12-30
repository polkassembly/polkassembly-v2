// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Small Tipper'
				description='Origin able to spend up to 250 DOT from the treasury at onceShow.'
				proposalType={EProposalType.REFERENDUM_V2}
				origins={[EPostOrigin.SMALL_SPENDER]}
			/>
		</div>
	);
}

export default Page;
