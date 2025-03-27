// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-await-in-loop */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

import { ENetwork } from '@shared/types';

// Usage:
// const assethubApiService = await AssethubApiService.Init(ENetwork.POLKADOT);
// const blockHeight = await assethubApiService.getBlockHeight();

export class AssethubApiService {
	private readonly network: ENetwork;

	private assethubApi: ApiPromise;

	private currentAssethubRpcEndpointIndex: number;

	private constructor(network: ENetwork, api: ApiPromise) {
		this.network = network;
		this.assethubApi = api;
		this.currentAssethubRpcEndpointIndex = 0;
	}

	static async Init(network: ENetwork): Promise<AssethubApiService> {
		if (!NETWORKS_DETAILS[`${network}`]?.assethubDetails) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Assethub details not found');
		}

		const api = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[`${network}`].assethubDetails?.rpcEndpoints[0].url)
		});

		await api.isReady;

		return new AssethubApiService(network, api);
	}

	async disconnect(): Promise<void> {
		await this.assethubApi.disconnect();
	}

	getCurrentRpcIndex(): number {
		return this.currentAssethubRpcEndpointIndex;
	}

	async getBlockHeight(): Promise<number> {
		const header = await this.assethubApi.rpc.chain.getHeader();
		return header.number.toNumber();
	}

	async keepAlive(): Promise<void> {
		await this.getBlockHeight();
	}

	async reconnect(): Promise<void> {
		if (this.assethubApi.isConnected && (await this.assethubApi.isReady)) return;

		try {
			this.assethubApi = await ApiPromise.create({
				provider: new WsProvider(NETWORKS_DETAILS[this.network].assethubDetails?.rpcEndpoints[this.currentAssethubRpcEndpointIndex].url)
			});

			await this.assethubApi.isReady;
		} catch {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Failed to reconnect to Assethub');
		}
	}

	async ready() {
		await this.assethubApi.isReady;
	}

	async getAssethubTreasuryAssetsBalance(): Promise<{ [key: string]: BN }> {
		const assetIds = Object.keys(NETWORKS_DETAILS[this.network].supportedAssets || {});
		const treasuryAddress = TREASURY_NETWORK_CONFIG[this.network]?.assetHubTreasuryAddress;
		const balances: { [key: string]: BN } = {};

		await Promise.all(
			assetIds.map(async (assetId) => {
				const data: any = await this.assethubApi.query.assets.account(assetId, treasuryAddress);
				const assetInfo = data.unwrap();
				balances[`${assetId}`] = new BN(assetInfo.balance.toBigInt());
			})
		);

		const nativeTokenData: any = await this.assethubApi?.query?.system?.account(treasuryAddress);
		if (nativeTokenData?.data?.free) {
			const freeTokenBalance = nativeTokenData.data.free.toBigInt();
			balances[`${NETWORKS_DETAILS[this.network].tokenSymbol}`] = new BN(freeTokenBalance);
		}

		return balances;
	}
}
