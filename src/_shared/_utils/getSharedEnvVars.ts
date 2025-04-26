// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAppEnv } from '../types';

// NOTE: THIS FILE SHOULD STRICTLY EXPORT ONLY PUBLIC ENVs
// (should start with NEXT_PUBLIC_)

export const getSharedEnvVars = () => ({
	NEXT_PUBLIC_APP_ENV: (process.env.NEXT_PUBLIC_APP_ENV as EAppEnv) || EAppEnv.DEVELOPMENT,
	NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK || '',
	NEXT_PUBLIC_IMBB_KEY: process.env.NEXT_PUBLIC_IMBB_KEY || '',
	NEXT_PUBLIC_POLKASSEMBLY_API_KEY: process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
	NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
	NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''
});
