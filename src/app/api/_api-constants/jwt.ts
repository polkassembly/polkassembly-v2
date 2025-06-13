// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CookieSerializeOptions } from 'cookie';
// import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
// import { EAppEnv } from '@/_shared/types';
import { ACCESS_TOKEN_LIFE_IN_SECONDS, REFRESH_TOKEN_LIFE_IN_SECONDS } from './timeConstants';

// const { NEXT_PUBLIC_APP_ENV } = getSharedEnvVars();

// Standard options for same-site usage
const STANDARD_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: true,
	secure: true
};

// Options for iframe compatibility (cross-site)
const IFRAME_COMPATIBLE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: 'none',
	secure: true
};

export function getRefreshTokenCookieOptions(isIframe: boolean = false): CookieSerializeOptions {
	return {
		...(isIframe ? IFRAME_COMPATIBLE_OPTIONS : STANDARD_COOKIE_OPTIONS),
		maxAge: REFRESH_TOKEN_LIFE_IN_SECONDS
	};
}

export function getAccessTokenCookieOptions(isIframe: boolean = false): CookieSerializeOptions {
	return {
		...(isIframe ? IFRAME_COMPATIBLE_OPTIONS : STANDARD_COOKIE_OPTIONS),
		maxAge: ACCESS_TOKEN_LIFE_IN_SECONDS
	};
}
