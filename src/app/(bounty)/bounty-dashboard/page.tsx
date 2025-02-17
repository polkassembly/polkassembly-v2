// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import BountyHeader from './Components/BountyHeader';

function page() {
	return (
		<div className='grid grid-cols-1 gap-2 p-5 sm:p-10'>
			<div className='flex items-center justify-between'>
				<span className='font-pixelify text-3xl font-bold text-btn_secondary_text'>Dashboard</span>
				<div className='flex gap-2'>
					{/* <BountyProposalActionButton className='hidden md:block' />
					<CuratorDashboardButton /> */}
				</div>
			</div>
			<BountyHeader />
		</div>
	);
}

export default page;
