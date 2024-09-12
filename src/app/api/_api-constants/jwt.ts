// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NEXT_PUBLIC_APP_ENV } from '@shared/_constants/envVars';
import { CookieSerializeOptions } from 'cookie';
import { ACCESS_TOKEN_LIFE_IN_SECONDS, REFRESH_TOKEN_LIFE_IN_SECONDS } from './timeConstants';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: REFRESH_TOKEN_LIFE_IN_SECONDS,
	path: '/',
	sameSite: true,
	secure: NEXT_PUBLIC_APP_ENV === 'production'
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: ACCESS_TOKEN_LIFE_IN_SECONDS,
	path: '/',
	sameSite: true,
	secure: NEXT_PUBLIC_APP_ENV === 'production'
};
