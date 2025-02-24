// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Overview from './Components/Overview';

function page() {
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-10'>
			<Overview />
		</div>
	);
}

export default page;
