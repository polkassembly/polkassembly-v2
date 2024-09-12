// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NEXT_API_KEY, NEXT_BACKEND_URL } from '@shared/_constants/envVars';
import fetchPonyfill from 'fetch-ponyfill';

const { fetch: fetchPF } = fetchPonyfill();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request(endpoint: string, reqHeaders?: any, options?: any): Promise<{ data: any; error: any }> {
	const url = `${NEXT_BACKEND_URL}${endpoint}`;
	const headers = {
		Accept: 'application/json',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'Content-Type': 'application/json',
		'x-api-key': NEXT_API_KEY,
		'x-network': 'rococo',
		...reqHeaders
	};
	const config = {
		...options,
		headers
	};
	try {
		const data = await (await fetchPF(url, config)).json();
		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}
