// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getDefaultStore } from 'jotai';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ENetwork } from '@shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { selectedRpcEndpointAtom } from '@/app/_atoms/polkadotJsApiAtom';
import { ClientError } from '../_client-utils/clientError';

export class PolkadotApiService {
	private readonly network: ENetwork;

	private api: ApiPromise;

	private currentRpcEndpointIndex: number;

	private currentRpcEndpoint: string;

	private constructor(network: ENetwork, api: ApiPromise, currentRpcEndpoint: string) {
		this.network = network;
		this.api = api;
		this.currentRpcEndpointIndex = 0;
		this.currentRpcEndpoint = currentRpcEndpoint;
	}

	static async Init(network: ENetwork): Promise<PolkadotApiService> {
		const store = getDefaultStore();
		const rpcEndpoint = store.get(selectedRpcEndpointAtom) as string;

		const api = await ApiPromise.create({
			provider: new WsProvider(rpcEndpoint)
		});

		return new PolkadotApiService(network, api, rpcEndpoint);
	}

	async switchToRpcEndpoint(newRpcEndpoint: string): Promise<void> {
		await this.api.disconnect();

		this.api = await ApiPromise.create({
			provider: new WsProvider(newRpcEndpoint)
		});

		this.currentRpcEndpoint = newRpcEndpoint;
	}

	async disconnect(): Promise<void> {
		await this.api.disconnect();
	}

	getCurrentRpcIndex(): number {
		return this.currentRpcEndpointIndex;
	}

	getCurrentRpcEndpoint(): string {
		return this.currentRpcEndpoint;
	}

	async switchToNextRpcEndpoint(): Promise<void> {
		const store = getDefaultStore();
		const rpcEndpoints = store.get(selectedRpcEndpointAtom);

		if (!Array.isArray(rpcEndpoints)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid RPC index');
		}

		const currentIndex = rpcEndpoints.findIndex((endpoint) => endpoint === this.currentRpcEndpoint);

		const nextIndex = (currentIndex + 1) % rpcEndpoints.length;
		const nextRpcEndpoint = rpcEndpoints[nextIndex];

		await this.switchToRpcEndpoint(nextRpcEndpoint);
	}

	async switchToNewRpcEndpoint(index?: number): Promise<void> {
		if (index) {
			// check if valid index
			if (index < 0 || index >= NETWORKS_DETAILS[this.network].rpcEndpoints.length) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid RPC index');
			}
			this.currentRpcEndpointIndex = index;
		} else {
			this.currentRpcEndpointIndex = (this.currentRpcEndpointIndex + 1) % NETWORKS_DETAILS[this.network].rpcEndpoints.length;
		}

		this.api.disconnect();
		this.api = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[this.network].rpcEndpoints[this.currentRpcEndpointIndex].url)
		});
	}

	async getBlockHeight(): Promise<number> {
		const header = await this.api.rpc.chain.getHeader();
		return header.number.toNumber();
	}

	async keepAlive(): Promise<void> {
		await this.getBlockHeight();
	}
}
