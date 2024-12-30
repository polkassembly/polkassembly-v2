// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';

function Page() {
	return (
		<div>
			<ListingPage
				title='Discussions'
				description='A space to share insights, provide feedback, and collaborate on ideas that impact the network.'
				proposalType={EProposalType.DISCUSSION}
			/>
		</div>
	);
}

export default Page;
