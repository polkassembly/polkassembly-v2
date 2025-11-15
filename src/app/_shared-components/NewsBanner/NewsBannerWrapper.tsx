// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { usePathname } from 'next/navigation';
import NewsBanner from './NewsBanner';

function NewsBannerWrapper() {
	const pathname = usePathname();

	const hideOnDetailPages = [/^\/post\/[^/]+$/, /^\/proposal\/[^/]+$/, /^\/referenda\/[^/]+$/, /^\/bounty\/[^/]+$/, /^\/child-bounty\/[^/]+$/];

	const showBanner = !hideOnDetailPages.some((pattern) => pattern.test(pathname));

	if (!showBanner) {
		return null;
	}

	return <NewsBanner />;
}

export default NewsBannerWrapper;
