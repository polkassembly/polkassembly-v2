// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import { IMultisig, IProxy } from '@/_shared/types';
import { SUBSCAN_API_KEY } from '@/app/api/_api-constants/apiEnvVars';
import { fetchSubscanData } from '@/app/api/_api-utils/fetchSubscanData';

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

enum ESubscanErrorMessages {
	RECORD_NOT_FOUND = 'Record Not Found'
}

interface IResponseData {
	multisig: Array<IMultisig>;
	proxy: Array<IProxy>;
	proxied: Array<IProxy>;
}

export class SubscanAddressService {
	private static subscanUrl = (network: string) => `https://${network}.api.subscan.io/api/v2/scan/search`;

	private static async GetAccountInfo({ address, network }: { address: string; network: string }) {
		const data = await fetchSubscanData(this.subscanUrl(network), network, { key: address }, 'POST');

		if (data.message === ESubscanErrorMessages.RECORD_NOT_FOUND) {
			return {};
		}

		const info = ['name', 'email', 'github', 'twitter', 'matrix', 'discord'].map((key) => data.data?.account?.[key]);

		return {
			...info
		};
	}

	private static async GetProxyAddresses({ addresses, network }: { addresses: Array<IProxy>; network: string }) {
		const response: Array<IProxy> = [];
		for (const proxy of addresses) {
			const info = await this.GetAccountInfo({ address: proxy.address, network });
			const proxyData: IProxy = {
				address: proxy.address,
				proxyType: proxy.proxyType,
				...info
			};
			response.push(proxyData);
		}
		return response;
	}

	static async GetAccountsFromAddress({ address, network }: { address: string; network: string }) {
		const responseData: IResponseData = {
			multisig: [],
			proxied: [],
			proxy: []
		};
		const data = await fetchSubscanData(this.subscanUrl(network), network, { key: address }, 'POST');

		if (data.message === ESubscanErrorMessages.RECORD_NOT_FOUND) {
			return {
				data: null,
				error: ESubscanErrorMessages.RECORD_NOT_FOUND,
				status: 404
			};
		}

		const proxyAddresses =
			data.data?.account?.proxy?.proxy_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
				address: proxy.account_display.address,
				proxyType: proxy.proxy_type
			})) || [];
		const realAccount =
			data.data?.account?.proxy?.real_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
				address: proxy.account_display.address,
				proxyType: proxy.proxy_type
			})) || [];
		const multisigAddress = data.data?.account?.multisig?.multi_account?.map((multisig: { address: string }) => multisig.address) || [];

		// fetch for multisig addresses
		for (const multisig of multisigAddress) {
			const data = await fetchSubscanData(this.subscanUrl(network), network, { key: address }, 'POST');

			const multisigMembers = data.data?.account?.multisig?.multi_account_member?.map((member: { address: string }) => member.address);
			const pureProxy = data.data?.account?.proxy?.real_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
				address: proxy.account_display.address,
				proxyType: proxy.proxy_type
			}));
			const threshold = data.data?.account?.multisig?.multi_account_threshold;
			const info = ['name', 'email', 'github', 'twitter', 'matrix', 'discord'].map((key) => data.data?.account?.[key]);

			const multisigData: IMultisig = {
				address: multisig,
				pureProxy,
				signatories: multisigMembers,
				threshold,
				...info
			};
			responseData.multisig.push(multisigData);
		}

		responseData.proxy = await this.GetProxyAddresses({ addresses: realAccount, network });
		responseData.proxied = await this.GetProxyAddresses({ addresses: proxyAddresses, network });

		return responseData;
	}
}
