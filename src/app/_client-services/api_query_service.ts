// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalStatus, IListingResponse } from '@/_shared/types';

class QueryService {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async fetchListingData(proposalType: string, page: number, statuses?: EProposalStatus[]): Promise<IListingResponse[]> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: '10'
		});

		if (statuses && statuses.length > 0) {
			statuses.forEach((status) => queryParams.append('status', status));
		}

		const response = await fetch(`${this.baseUrl}/api/v2/${proposalType}?${queryParams.toString()}`, {
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
