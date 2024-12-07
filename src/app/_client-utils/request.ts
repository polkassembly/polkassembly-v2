// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { RequestInit } from 'next/dist/server/web/spec-extension/request';

// of the Apache-2.0 license. See the LICENSE file for details.

export function request<T>(endpoint: string, reqHeaders?: object, options?: RequestInit): Promise<T> {
	const baseUrl = window.location.origin;
	const reqURL = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

	const url = `${baseUrl}/api/v2/${reqURL}`;

	const headers = {
		Accept: 'application/json',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'Content-Type': 'application/json',
		...reqHeaders
	};
	const config = {
		...options,
		headers
	};
	return fetchPF(url, config)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('error', error);
			throw new Error(error.message);
		});
}
