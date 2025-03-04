// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPostListing } from '@/_shared/types';

function BountyProposal({ bountyProposals }: { bountyProposals: IGenericListingResponse<IPostListing> }) {
	console.log('bountyProposals', bountyProposals);
	return (
		<div className='mt-5'>
			<h3 className='font-pixelify text-3xl font-bold text-btn_secondary_text'>Bounty Proposal</h3>
		</div>
	);
}

export default BountyProposal;
