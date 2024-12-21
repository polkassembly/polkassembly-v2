// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from './next_api_client_service';

export class QueryService extends NextApiClientService {
	static async fetchListingData(proposalType: string, page: number, statuses?: string[], origins?: string) {
		return this.fetchListingDataApi(proposalType, page, statuses, origins);
	}
}
