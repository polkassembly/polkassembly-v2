// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const setCookie = (name: string, value: string, days = 30) => {
	const maxAge = days * 24 * 60 * 60;
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
};

export const getCookie = (name: string): string | null => {
	const cookies = document.cookie.split(';');
	const foundCookie = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
	return foundCookie ? decodeURIComponent(foundCookie.split('=')[1]) : null;
};
