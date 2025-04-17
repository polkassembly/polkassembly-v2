// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IMultisig, IProxy } from '@/_shared/types';
import { NextApiClientService } from './next_api_client_service';

/**
 * @description This class is used to use all the features related to multisig and proxy
 */
export class MultisigService {
	/**
	 * @description This method is used to fetch multisig and proxy addresses from the users addresses
	 * @param address - The address of the user
	 * @returns The multisig and proxy addresses
	 */
	static async fetchMultisigAndProxyAddresses(address: string): Promise<{
		multisig: Array<IMultisig>;
		proxy: Array<IProxy>;
		proxied: Array<IProxy>;
	}> {
		const { data, error } = await NextApiClientService.fetchMultisigAndProxyAddresses(address);
		if (error || !data) {
			console.error('Error fetching multisig and proxy', error);
			return {
				multisig: [],
				proxied: [],
				proxy: []
			};
		}
		return data;
	}
}
