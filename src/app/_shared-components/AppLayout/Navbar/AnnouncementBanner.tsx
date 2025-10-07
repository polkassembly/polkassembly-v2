// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';

function AnnouncementBanner({ message }: { message: string | ReactNode }) {
	return <div className='flex w-full items-center justify-center bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-white'>{message}</div>;
}

export default AnnouncementBanner;
