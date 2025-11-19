// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';

function AnnouncementBanner({ message }: { message: string | ReactNode }) {
	return (
		<div className='flex w-full items-center justify-center rounded-b-[20px] bg-[linear-gradient(90deg,_#42122C_0%,_#A6075C_33%,_#952863_77%,_#E5007A_100%)] px-4 py-2 text-sm font-medium text-white'>
			{message}
		</div>
	);
}

export default AnnouncementBanner;
