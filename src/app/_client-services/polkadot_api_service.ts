// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN, BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import type { AccountData } from '@polkadot/types/interfaces';
import { ENetwork } from '@shared/types';

// Usage:
// const apiService = await PolkadotApiService.Init(ENetwork.POLKADOT);
// const blockHeight = await apiService.getBlockHeight();

export class PolkadotApiService {
	private readonly network: ENetwork;
	private api: ApiPromise;
	private currentRpcEndpointIndex: number;

	private constructor(network: ENetwork, api: ApiPromise) {
		this.network = network;
		this.api = api;
		this.currentRpcEndpointIndex = 0;
	}

	static async Init(network: ENetwork): Promise<PolkadotApiService> {
		const api = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[network as ENetwork].rpcEndpoints[0].url)
		});

		await api.isReady;

		return new PolkadotApiService(network, api);
	}

	async disconnect(): Promise<void> {
		await this.api.disconnect();
	}

	getCurrentRpcIndex(): number {
		return this.currentRpcEndpointIndex;
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

	async getSpendPeriodConst(): Promise<{ spendPeriodBlocks: number }> {
		const spendPeriodConst = this.api.consts.treasury?.spendPeriod;
		if (!spendPeriodConst) {
			throw new Error('Spend period not defined in the Treasury module');
		}

		const spendPeriodBlocks = (spendPeriodConst as unknown as BN).toNumber();

		return { spendPeriodBlocks };
	}

	async getTreasuryAccountDetails(): Promise<{ treasuryAccount: string; systemAccount: AccountData; burn: BN }> {
		const EMPTY_U8A_32 = new Uint8Array(32);

		const treasuryAccount = u8aConcat('modl', this.api.consts.treasury?.palletId ? (this.api.consts.treasury.palletId.toU8a(true) as Uint8Array) : new Uint8Array(), EMPTY_U8A_32);
		const systemAccount = (await this.api.query.system.account(u8aToHex(treasuryAccount))) as unknown as { data: AccountData };
		const freeBalance = new BN(systemAccount?.data?.free) || BN_ZERO;

		const burn =
			freeBalance.gt(BN_ZERO) && !((this.api.consts.treasury?.burn || BN_ZERO) as unknown as BN).isZero()
				? ((this.api.consts.treasury?.burn || BN_ZERO) as unknown as BN).mul(freeBalance).div(BN_MILLION)
				: BN_ZERO;

		return {
			treasuryAccount: u8aToHex(treasuryAccount),
			systemAccount: systemAccount.data,
			burn
		};
	}
}
