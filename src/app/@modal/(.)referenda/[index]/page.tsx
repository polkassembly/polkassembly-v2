// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, IPost } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import ReferendaDialog from '@ui/ListingComponent/ReferendaDialog';

async function Referenda({ params }: { params: Promise<{ index: string }> }) {
	const result = await NextApiClientService.fetchProposalDetails(EProposalType.REFERENDUM_V2, (await params).index);

	if (result.error) {
		return <div className='text-center text-text_primary'>{result.error.message}</div>;
	}

	return (
		<ReferendaDialog
			data={result.data as IPost}
			index={(await params).index}
		/>
	);
}

export default Referenda;
