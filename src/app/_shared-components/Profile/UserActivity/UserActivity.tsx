// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Votes from './Votes/Votes';
import Activities from './Activities/Activities';

function UserActivity({ addresses, userId }: { addresses: string[]; userId?: number }) {
	return (
		<div className='flex flex-col gap-y-4'>
			<Votes
				addresses={addresses}
				userId={userId}
			/>
			<Activities userId={userId} />
		</div>
	);
}

export default UserActivity;
