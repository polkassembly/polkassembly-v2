// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import ReferendaDialog from '@ui/ListingComponent/ReferendaDialog';

async function Referenda({ params }: { params: Promise<{ index: string }> }) {
	return <ReferendaDialog index={(await params).index} />;
}

export default Referenda;
