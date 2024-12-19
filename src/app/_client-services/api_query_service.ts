// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IListingResponse } from '@/_shared/types';

class QueryService {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async fetchListingData(proposalType: string, page: number): Promise<IListingResponse[]> {
		const response = await fetch(`${this.baseUrl}/api/v2/${proposalType}?page=${page}&limit=10`, {
			headers: {
				'Content-Type': 'application/json',
				'x-network': 'polkadot'
			}
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const result = await response.json();
		return result as IListingResponse[];
	}
}

const queryService = new QueryService('');

// eslint-disable-next-line
export default queryService;
