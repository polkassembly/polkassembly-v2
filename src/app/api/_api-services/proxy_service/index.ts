// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, IProxyListingResponse } from '@/_shared/types';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';

export class ProxyService {
	static async GetProxyRequests({ network, page, limit, search }: { network: ENetwork; page: number; limit: number; search?: string }): Promise<IProxyListingResponse> {
		const apiService = await PolkadotApiService.Init(network);
		return apiService.getProxyRequests({ page, limit, search });
	}

	static async GetMyProxies({
		network,
		page,
		limit,
		search,
		userAddress
	}: {
		network: ENetwork;
		page: number;
		limit: number;
		search?: string;
		userAddress: string;
	}): Promise<IProxyListingResponse> {
		const apiService = await PolkadotApiService.Init(network);
		return apiService.getMyProxies({ page, limit, search, userAddress });
	}
}
