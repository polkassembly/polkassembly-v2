// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString, isHex } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

import { ENetwork, IOnChainIdentity } from '@shared/types';

// Usage:
// const identityService = await IdentityService.Init(ENetwork.POLKADOT, api);
// const username = await identityService.getOnChainUsername();

export class IdentityService {
	private readonly network: ENetwork;
	private peopleChainApi: ApiPromise;
	private currentPeopleChainRpcEndpointIndex: number;

	private constructor(network: ENetwork, api: ApiPromise) {
		this.network = network;
		this.peopleChainApi = api;
		this.currentPeopleChainRpcEndpointIndex = 0;
	}

	static async Init(network: ENetwork): Promise<IdentityService> {
		const api = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[network as ENetwork].peopleChainEndpoints[0].url)
		});

		await api.isReady;

		return new IdentityService(network, api);
	}

	async disconnect(): Promise<void> {
		await this.peopleChainApi.disconnect();
	}

	getCurrentRpcIndex(): number {
		return this.currentPeopleChainRpcEndpointIndex;
	}

	async switchToNewRpcEndpoint(index?: number): Promise<void> {
		if (index) {
			// check if valid index
			if (index < 0 || index >= NETWORKS_DETAILS[this.network].rpcEndpoints.length) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid RPC index');
			}
			this.currentPeopleChainRpcEndpointIndex = index;
		} else {
			this.currentPeopleChainRpcEndpointIndex = (this.currentPeopleChainRpcEndpointIndex + 1) % NETWORKS_DETAILS[this.network].peopleChainEndpoints.length;
		}

		this.peopleChainApi.disconnect();
		this.peopleChainApi = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[this.network].peopleChainEndpoints[this.currentPeopleChainRpcEndpointIndex].url)
		});
		await this.peopleChainApi.isReady;
	}

	async getBlockHeight(): Promise<number> {
		const header = await this.peopleChainApi.rpc.chain.getHeader();
		return header.number.toNumber();
	}

	async keepAlive(): Promise<void> {
		await this.getBlockHeight();
	}

	async reconnect(): Promise<void> {
		if (this.peopleChainApi.isConnected && (await this.peopleChainApi.isReady)) return;

		try {
			this.peopleChainApi = await ApiPromise.create({
				provider: new WsProvider(NETWORKS_DETAILS[this.network].peopleChainEndpoints[this.currentPeopleChainRpcEndpointIndex].url)
			});

			await this.peopleChainApi.isReady;
		} catch {
			await this.switchToNewRpcEndpoint();
		}
	}

	async ready() {
		await this.peopleChainApi.isReady;
	}

	private async getParentProxyInfo({ address }: { address: string }) {
		const encodedAddress = getEncodedAddress(address, this.network) || address;

		const proxyInfo = await this.peopleChainApi?.query?.identity?.superOf(encodedAddress);
		const formatedProxyInfo: any = proxyInfo?.toHuman();
		if (formatedProxyInfo && formatedProxyInfo?.[0] && getEncodedAddress(formatedProxyInfo?.[0] || '', this.network)) {
			return { address: formatedProxyInfo?.[0], title: formatedProxyInfo?.[1]?.Raw || null };
		}
		return { address: '', title: null };
	}

	private static processIdentityInfo(identityInfo: any): { isGood: boolean; unverified: boolean } {
		const infoCall =
			identityInfo?.judgements?.filter(([, judgement]: any[]): boolean => {
				return ['KnownGood', 'Reasonable'].includes(judgement);
			}) || [];

		const unverified = !infoCall?.length || !identityInfo?.judgements?.length;
		const isGood = identityInfo?.judgements.some(([, judgement]: any[]): boolean => {
			return ['KnownGood', 'Reasonable'].includes(judgement);
		});

		return { isGood, unverified };
	}

	private checkVerifiedByPolkassembly(identityInfo: any): boolean {
		const infoCall =
			identityInfo?.judgements?.filter(([, judgement]: any[]): boolean => {
				return ['KnownGood', 'Reasonable'].includes(judgement);
			}) || [];

		return infoCall
			? infoCall.some(([index, judgement]: any[]) => {
					return NETWORKS_DETAILS[this.network].identityRegistrarIndex === index && ['KnownGood', 'Reasonable'].includes(judgement);
				})
			: false;
	}

	async getOnChainIdentity(address: string): Promise<IOnChainIdentity> {
		const encodedQueryAddress = getEncodedAddress(address, this.network) || address;
		const parentProxyInfo = await this.getParentProxyInfo({ address: encodedQueryAddress });
		const encodedAddress = parentProxyInfo?.address ? getEncodedAddress(parentProxyInfo.address, this.network) : encodedQueryAddress;

		const identityInfo: any = await this.peopleChainApi?.query.identity?.identityOf(encodedAddress).then((res: any) => res?.toHuman()?.[0]);

		const { isGood, unverified } = IdentityService.processIdentityInfo(identityInfo);
		const verifiedByPolkassembly = this.checkVerifiedByPolkassembly(identityInfo);
		const identity = identityInfo?.info;

		return {
			discord: identity?.discord?.Raw || '',
			display: isHex(identity?.display?.Raw || '') ? hexToString(identity?.display?.Raw) || identity?.display?.Raw || '' : identity?.display?.Raw || '',
			displayParent: identity?.displayParent?.Raw || '',
			email: identity?.email?.Raw || '',
			github: identity?.github?.Raw || '',
			isGood: isGood || false,
			isIdentitySet: !!identity?.display?.Raw,
			isVerified: !unverified,
			judgements: identityInfo?.judgements || [],
			legal: isHex(identity?.legal?.Raw || '') ? hexToString(identity?.legal?.Raw) || identity?.legal?.Raw || '' : identity?.legal?.Raw || '',
			matrix: identity?.matrix?.Raw || identity?.riot?.Raw || '',
			nickname: identity?.nickname?.Raw || '',
			parentProxyAddress: parentProxyInfo?.address || '',
			parentProxyTitle: parentProxyInfo?.title || null,
			twitter: identity?.twitter?.Raw || '',
			verifiedByPolkassembly: verifiedByPolkassembly || false,
			web: identity?.web?.Raw || ''
		};
	}
}
