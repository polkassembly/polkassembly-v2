// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CookieSerializeOptions } from 'cookie';
// import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
// import { EAppEnv } from '@/_shared/types';
import { ACCESS_TOKEN_LIFE_IN_SECONDS, REFRESH_TOKEN_LIFE_IN_SECONDS } from './timeConstants';

// const { NEXT_PUBLIC_APP_ENV } = getSharedEnvVars();

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: true,
	secure: true,
	maxAge: REFRESH_TOKEN_LIFE_IN_SECONDS
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: true,
	secure: true,
	maxAge: ACCESS_TOKEN_LIFE_IN_SECONDS
};

// Options for iframe compatibility (cross-site)
export const IFRAME_ACCESS_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: 'none',
	secure: true,
	maxAge: ACCESS_TOKEN_LIFE_IN_SECONDS
};

export const IFRAME_REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: false,
	path: '/',
	sameSite: 'none',
	secure: true,
	maxAge: REFRESH_TOKEN_LIFE_IN_SECONDS
};
