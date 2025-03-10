// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Signer } from '@polkadot/types/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

import { ENetwork, EVoteDecision, IVoteCartItem } from '@shared/types';

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
		await this.api.isReady;
	}

	async getBlockHeight(): Promise<number> {
		const header = await this.api.rpc.chain.getHeader();
		return header.number.toNumber();
	}

	async keepAlive(): Promise<void> {
		await this.getBlockHeight();
	}

	async reconnect(): Promise<void> {
		if (this.api.isConnected && (await this.api.isReady)) return;

		try {
			this.api = await ApiPromise.create({
				provider: new WsProvider(NETWORKS_DETAILS[this.network].rpcEndpoints[this.currentRpcEndpointIndex].url)
			});

			await this.api.isReady;
		} catch {
			await this.switchToNewRpcEndpoint();
		}
	}

	setSigner(signer: Signer) {
		this.api.setSigner(signer);
	}

	async apiReady() {
		await this.api.isReady;
	}

	async getExistentialDeposit() {
		return this.api.consts.balances.existentialDeposit;
	}

	async getUserBalances({ address }: { address: string }) {
		let freeBalance = BN_ZERO;
		let lockedBalance = BN_ZERO;
		let totalBalance = BN_ZERO;

		const responseObj = {
			freeBalance,
			lockedBalance,
			totalBalance
		};

		if (!address || !this.api?.derive?.balances?.all) {
			return responseObj;
		}

		const encodedAddress = getEncodedAddress(address, this.network) || address;
		await this.api.derive.balances
			.all(encodedAddress)
			.then((result) => {
				lockedBalance = new BN(result.lockedBalance || lockedBalance);
			})
			.catch(() => {
				// TODO: show notification
			});

		await this.api.query.system
			.account(encodedAddress)
			.then((result: any) => {
				const free = new BN(result?.data?.free) || BN_ZERO;
				const reserved = new BN(result?.data?.reserved) || BN_ZERO;
				totalBalance = free.add(reserved);
				freeBalance = free;
			})
			.catch(() => {
				// TODO: show notification
			});

		return {
			freeBalance,
			lockedBalance,
			totalBalance
		};
	}

	async voteReferendum({
		address,
		onSuccess,
		onFailed,
		referendumId,
		vote,
		lockedBalance,
		conviction,
		ayeVoteValue,
		nayVoteValue,
		abstainVoteValue
	}: {
		address: string;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		referendumId: number;
		vote: EVoteDecision;
		lockedBalance?: BN;
		conviction?: number;
		ayeVoteValue?: BN;
		nayVoteValue?: BN;
		abstainVoteValue?: BN;
	}) {
		let voteTx: SubmittableExtrinsic<'promise'> | null = null;

		if ([EVoteDecision.AYE, EVoteDecision.NAY].includes(vote) && lockedBalance) {
			voteTx = this.api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye: vote === EVoteDecision.AYE, conviction } } });
		} else if (vote === EVoteDecision.SPLIT) {
			voteTx = this.api.tx.convictionVoting.vote(referendumId, { Split: { aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` } });
		} else if (vote === EVoteDecision.SPLIT_ABSTAIN && ayeVoteValue && nayVoteValue) {
			voteTx = this.api.tx.convictionVoting.vote(referendumId, {
				SplitAbstain: { abstain: `${abstainVoteValue?.toString()}`, aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` }
			});
		}

		if (voteTx) {
			await this.executeTx({
				tx: voteTx,
				address,
				errorMessageFallback: 'Failed to vote',
				onSuccess,
				onFailed,
				waitTillFinalizedHash: true
			});
		}
	}

	async batchVoteReferendum({
		address,
		voteCartItems,
		onSuccess,
		onFailed
	}: {
		address: string;
		voteCartItems: IVoteCartItem[];
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
	}) {
		if (!this.api) return;

		const voteTxList = voteCartItems.map((voteCartItem) => {
			let voteTx: SubmittableExtrinsic<'promise'> | null = null;
			const vote = voteCartItem.decision;
			const ayeVoteValue = voteCartItem.amount.aye;
			const nayVoteValue = voteCartItem.amount.nay;
			const abstainVoteValue = voteCartItem.amount.abstain;
			const referendumId = voteCartItem.postIndexOrHash;
			const { conviction } = voteCartItem;
			if ([EVoteDecision.AYE, EVoteDecision.NAY].includes(vote) && (ayeVoteValue || nayVoteValue)) {
				voteTx = this.api.tx.convictionVoting.vote(referendumId, {
					Standard: { balance: vote === EVoteDecision.AYE ? ayeVoteValue : nayVoteValue, vote: { aye: vote === EVoteDecision.AYE, conviction } }
				});
			} else if (vote === EVoteDecision.SPLIT) {
				voteTx = this.api.tx.convictionVoting.vote(referendumId, { Split: { aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` } });
			} else if (vote === EVoteDecision.SPLIT_ABSTAIN && ayeVoteValue && nayVoteValue) {
				voteTx = this.api.tx.convictionVoting.vote(referendumId, {
					SplitAbstain: { abstain: `${abstainVoteValue?.toString()}`, aye: `${ayeVoteValue?.toString()}`, nay: `${nayVoteValue?.toString()}` }
				});
			}
			if (voteTx) {
				return voteTx;
			}
			return null;
		});

		const tx = this.api.tx.utility.batchAll(voteTxList);
		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to batch vote',
			waitTillFinalizedHash: true,
			onSuccess,
			onFailed
		});
	}

	private async executeTx({
		tx,
		address,
		proxyAddress,
		params = {},
		errorMessageFallback,
		onSuccess,
		onFailed,
		onBroadcast,
		setStatus,
		setIsTxFinalized,
		waitTillFinalizedHash = false
	}: {
		tx: SubmittableExtrinsic<'promise'>;
		address: string;
		proxyAddress?: string;
		params?: Record<string, unknown>;
		errorMessageFallback: string;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		onBroadcast?: () => void;
		setStatus?: (pre: string) => void;
		setIsTxFinalized?: (pre: string) => void;
		waitTillFinalizedHash?: boolean;
	}) {
		let isFailed = false;
		if (!this.api || !tx) return;

		const extrinsic = proxyAddress ? this.api.tx.proxy.proxy(address, null, tx) : tx;

		const signerOptions = {
			...params,
			withSignedTransaction: true
		};

		extrinsic
			// eslint-disable-next-line sonarjs/cognitive-complexity
			.signAndSend(proxyAddress || address, signerOptions, async ({ status, events, txHash }) => {
				if (status.isInvalid) {
					console.log('Transaction invalid');
					setStatus?.('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
					setStatus?.('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
					setStatus?.('Transaction has been broadcasted');
					onBroadcast?.();
				} else if (status.isInBlock) {
					console.log('Transaction is in block');
					setStatus?.('Transaction is in block');

					// eslint-disable-next-line no-restricted-syntax
					for (const { event } of events) {
						if (event.method === 'ExtrinsicSuccess') {
							setStatus?.('Transaction Success');
							isFailed = false;
							if (!waitTillFinalizedHash) {
								// eslint-disable-next-line no-await-in-loop
								await onSuccess(txHash);
							}
						} else if (event.method === 'ExtrinsicFailed') {
							// eslint-disable-next-line sonarjs/no-duplicate-string
							setStatus?.('Transaction failed');
							console.log('Transaction failed');
							setStatus?.('Transaction failed');
							const dispatchError = (event.data as any)?.dispatchError;
							isFailed = true;

							if (dispatchError?.isModule) {
								const errorModule = (event.data as any)?.dispatchError?.asModule;
								const { method, section, docs } = this.api.registry.findMetaError(errorModule);
								// eslint-disable-next-line no-param-reassign
								errorMessageFallback = `${section}.${method} : ${docs.join(' ')}`;
								console.log(errorMessageFallback, 'error module');
								await onFailed(errorMessageFallback);
							} else if (dispatchError?.isToken) {
								console.log(`${dispatchError.type}.${dispatchError.asToken.type}`);
								await onFailed(`${dispatchError.type}.${dispatchError.asToken.type}`);
							} else {
								await onFailed(`${dispatchError.type}` || errorMessageFallback);
							}
						}
					}
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`tx: https://${this.network}.subscan.io/extrinsic/${txHash}`);
					setIsTxFinalized?.(txHash.toString());
					if (!isFailed && waitTillFinalizedHash) {
						await onSuccess(txHash);
					}
				}
			})
			.catch((error: unknown) => {
				console.log(':( transaction failed');
				setStatus?.(':( transaction failed');
				console.error('ERROR:', error);
				onFailed(error?.toString?.() || errorMessageFallback);
			});
	}

	async getDelegationTotalSupply(): Promise<BN> {
		if (!this.api) return new BN(0);
		try {
			const totalIssuance = await this.api.query.balances.totalIssuance();
			const inactiveIssuance = await this.api.query.balances.inactiveIssuance();

			if (!totalIssuance || !inactiveIssuance) {
				console.error('Failed to fetch issuance values');
				return new BN(0);
			}

			return new BN(totalIssuance.toString()).sub(new BN(inactiveIssuance.toString()));
		} catch (error) {
			console.error('Error in getDelegationTotalSupply:', error);
			return new BN(0);
		}
	}
}
