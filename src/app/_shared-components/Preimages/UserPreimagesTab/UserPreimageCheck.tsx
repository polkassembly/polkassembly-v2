// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IPreimage } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import NoUserPreimage from '@/app/_shared-components/Preimages/ListingTable/NoUserPreimage';

interface UserPreimageCheckProps {
	preimage: IPreimage | null;
}

function UserPreimageCheck({ preimage }: UserPreimageCheckProps) {
	const { user } = useUser();

	// Check if user owns this preimage
	const userOwnsPreimage =
		user &&
		preimage &&
		user.addresses &&
		user.addresses.some((address) => {
			const userSubstrateAddress = getSubstrateAddress(address);
			const preimageProposerSubstrateAddress = getSubstrateAddress(preimage.proposer);
			return userSubstrateAddress === preimageProposerSubstrateAddress;
		});

	if (userOwnsPreimage && preimage) {
		return (
			<ListingTable
				data={[preimage]}
				totalCount={1}
			/>
		);
	}

	return <NoUserPreimage />;
}

export default UserPreimageCheck;
