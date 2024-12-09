// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { ENetwork } from '@/_shared/types';

export async function nextApiClientFetch<T>(endpoint: string, data?: { [key: string]: unknown }, method?: 'GET' | 'POST'): Promise<T> {
	const baseUrl = window.location.origin;
	const reqURL = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

	const url = `${baseUrl}/api/v2/${reqURL}`;

	return fetchPF(url, {
		body: JSON.stringify(data),
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
			'x-network': ENetwork.POLKADOT
		},
		method: method || 'POST'
	})
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('error', error);
			throw new Error(error.message);
		});
}
