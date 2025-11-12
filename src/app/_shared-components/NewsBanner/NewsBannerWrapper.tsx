// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { usePathname } from 'next/navigation';
import NewsBanner from './NewsBanner';

function NewsBannerWrapper() {
	const pathname = usePathname();

	const showBanner = pathname === '/' || pathname.startsWith('/activity-feed');

	if (!showBanner) {
		return null;
	}

	return <NewsBanner />;
}

export default NewsBannerWrapper;
