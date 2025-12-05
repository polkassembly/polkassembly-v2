// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable camelcase */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ClientError } from '@app/_client-utils/clientError';
import { Keyring } from '@polkadot/api';
import { decodeAddress, blake2AsHex, blake2AsU8a, mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { TypeRegistry, Metadata } from '@polkadot/types';
import { BN, BN_ZERO, u8aToHex, u8aToU8a } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import {
	EAccountType,
	EEnactment,
	ENetwork,
	EPostOrigin,
	EVoteDecision,
	EWallet,
	IBeneficiaryInput,
	IParamDef,
	IPayout,
	ISelectedAccount,
	IVaultQrState,
	IVoteCartItem,
	EProxyType,
	IProxyRequest,
	IProxyAddress,
	IPapiAssetHubDescriptor
} from '@shared/types';
import { getSubstrateAddressFromAccountId } from '@/_shared/_utils/getSubstrateAddressFromAccountId';
import { APPNAME } from '@/_shared/_constants/appName';
import { Dispatch, SetStateAction } from 'react';

// papi imports
import { createClient, TypedApi, PolkadotClient, Transaction, TxCallData, CompatibilityToken, Binary } from 'polkadot-api';
import { getSmProvider } from 'polkadot-api/sm-provider';
import { startFromWorker } from 'polkadot-api/smoldot/from-worker';
import { getPolkadotSignerFromPjs } from 'polkadot-api/pjs-signer';
import { unifyMetadata, decAnyMetadata, UnifiedMetadata } from '@polkadot-api/substrate-bindings';
import { getLookupFn, MetadataLookup } from '@polkadot-api/metadata-builders';

import { MultiAddress } from '@polkadot-api/descriptors';
import { getInjectedWallet } from '../_client-utils/getInjectedWallet';
import { inputToBn } from '../_client-utils/inputToBn';
// import { VaultQrSigner } from './vault_qr_signer_service';
import { BlockCalculationsService } from './block_calculations_service';
import { isAHMNetwork } from '../_client-utils/isAHMNetwork';
import { convictionMap } from '../_client-utils/convictionMap';
import { VaultQrSigner } from './vault_qr_signer_service';

// Usage:
// const apiService = await PolkadotApiService.Init(ENetwork.POLKADOT);
// const blockHeight = await apiService.getBlockHeight();

export class PolkadotApiService {
	private readonly network: ENetwork;

	private api: TypedApi<IPapiAssetHubDescriptor>;

	private client: PolkadotClient;

	private relayClient: PolkadotClient;

	private compatibilityToken: CompatibilityToken<IPapiAssetHubDescriptor>;

	private unifiedMetadata: UnifiedMetadata | null;

	private lookup: MetadataLookup | null;

	private currentRpcEndpointIndex: number;

	private constructor(
		network: ENetwork,
		api: TypedApi<IPapiAssetHubDescriptor>,
		client: PolkadotClient,
		relayClient: PolkadotClient,
		compatibilityToken: CompatibilityToken<IPapiAssetHubDescriptor>,
		unifiedMetadata: UnifiedMetadata,
		lookup: MetadataLookup
	) {
		this.network = network;
		this.api = api;
		this.client = client;
		this.relayClient = relayClient;
		this.compatibilityToken = compatibilityToken;
		this.unifiedMetadata = unifiedMetadata;
		this.lookup = lookup;
		this.currentRpcEndpointIndex = 0;
	}

	static async Init(network: ENetwork): Promise<PolkadotApiService> {
		const relayChainSpec = NETWORKS_DETAILS[`${network}`]?.papiChainSpec;
		const assetHubChainSpec = NETWORKS_DETAILS[`${network}`]?.assethubDetails?.papiChainSpec;
		const papiRelayDescriptor = NETWORKS_DETAILS[`${network}`]?.papiDescriptor;
		const papiAssetHubDescriptor = NETWORKS_DETAILS[`${network}`]?.assethubDetails?.papiDescriptor;

		if (!relayChainSpec || !papiRelayDescriptor) {
			throw new Error('PAPI chain spec or descriptor not found');
		}

		const worker = new Worker(new URL('polkadot-api/smoldot/worker', import.meta.url));
		const smoldot = startFromWorker(worker);
		const relayChain = await smoldot.addChain({ chainSpec: relayChainSpec });

		if (isAHMNetwork(network) && assetHubChainSpec && papiAssetHubDescriptor) {
			const assetHubChain = await smoldot.addChain({ chainSpec: assetHubChainSpec, potentialRelayChains: [relayChain] });

			const client = createClient(getSmProvider(assetHubChain));
			const relayClient = createClient(getSmProvider(relayChain));
			client.finalizedBlock$.subscribe((finalizedBlock) => console.log('api init', finalizedBlock.number, finalizedBlock.hash));

			const papi = client.getTypedApi(papiAssetHubDescriptor);
			console.log('papi', network, (await client.getBlockHeader()).number);

			const compatibilityToken = await papi.compatibilityToken;

			const finalizedBlock = await client.getFinalizedBlock();
			console.log('finalizedBlock', finalizedBlock.number, finalizedBlock.hash);
			const metadata = await client.getMetadata(finalizedBlock.hash);
			console.log('metadata', metadata);

			// const registry = new TypeRegistry();
			// registry.setMetadata(new Metadata(registry, metadata));
			// if (properties) {
			// registry.setChainProperties(registry.createType('ChainProperties', properties) as any);
			// }

			const unifiedMetadata = unifyMetadata(decAnyMetadata(metadata));
			console.log('unifiedMetadata', unifiedMetadata);
			const lookup = getLookupFn(unifiedMetadata);
			console.log('lookup', lookup);

			return new PolkadotApiService(network, papi, client, relayClient, compatibilityToken, unifiedMetadata, lookup);
		}

		const client = createClient(getSmProvider(relayChain));
		client.finalizedBlock$.subscribe((finalizedBlock) => console.log('api init', finalizedBlock.number, finalizedBlock.hash));

		// To interact with the chain, you need to get the `TypedApi`, which includes
		// all the types for every call in that chain:

		const papi = client.getTypedApi(papiRelayDescriptor) as unknown as TypedApi<IPapiAssetHubDescriptor>;
		console.log('papi', network, (await client.getBlockHeader()).number);

		const compatibilityToken = (await papi.compatibilityToken) as unknown as CompatibilityToken<IPapiAssetHubDescriptor>;

		const blockHeader = await client.getBlockHeader();
		const metadata = await client.getMetadata(blockHeader.parentHash);
		const { properties } = await client.getChainSpecData();

		const registry = new TypeRegistry();
		registry.setMetadata(new Metadata(registry, metadata));
		if (properties) {
			registry.setChainProperties(registry.createType('ChainProperties', properties) as any);
		}

		const unifiedMetadata = unifyMetadata(decAnyMetadata(metadata));
		const lookup = getLookupFn(unifiedMetadata);

		return new PolkadotApiService(network, papi, client, client, compatibilityToken, unifiedMetadata, lookup);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	private async executeTx({
		tx,
		address,
		wallet,
		// params = {},
		errorMessageFallback,
		setVaultQrState,
		onSuccess,
		onFailed,
		onBroadcast,
		setStatus,
		setIsTxFinalized,
		waitTillFinalizedHash = false,
		selectedAccount
	}: {
		// tx: SubmittableExtrinsic<'promise'>;
		tx: Transaction<any, any, any, any>;
		address: string;
		wallet: EWallet;
		params?: Record<string, unknown>;
		errorMessageFallback: string;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		onBroadcast?: () => void;
		setStatus?: (pre: string) => void;
		setIsTxFinalized?: (pre: string) => void;
		waitTillFinalizedHash?: boolean;
		selectedAccount?: ISelectedAccount;
	}) {
		if (!this.api || !tx) return;

		if (wallet === EWallet.MIMIR) {
			const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');

			await web3Enable(APPNAME);
			const injected = await web3FromSource('mimir');
			const isMimir = injected.name === 'mimir';
			if (!isMimir) {
				return;
			}

			if (!injected.signer?.signPayload) {
				return;
			}

			try {
				// const callHex = tx.decodedCall.value.value;
				// const txEntry = this.api.txFromCallData(Binary.fromHex(callHex));
				const signer = getPolkadotSignerFromPjs(address, injected.signer.signPayload as any, injected.signer.signRaw as any);

				tx.signSubmitAndWatch(signer).subscribe({
					next: async (event) => {
						// evt: { type, txHash, ... }
						if (event.type === 'signed') {
							setStatus?.('Transaction is ready');
							return;
						}
						if (event.type === 'broadcasted') {
							setStatus?.('Transaction has been broadcasted');
							onBroadcast?.();
							return;
						}
						if (event.type === 'txBestBlocksState') {
							if (event.found && event.ok && !waitTillFinalizedHash) {
								setStatus?.('Transaction is in block');
								await onSuccess(event.txHash);
							}
							if (event.found && !event.ok) {
								setStatus?.('Transaction failed');
								onFailed(errorMessageFallback);
							}
							return;
						}
						if (event.type === 'finalized') {
							setStatus?.('Transaction finalized');
							setIsTxFinalized?.(event.txHash);
							if (event.ok) {
								await onSuccess(event.txHash);
							} else {
								onFailed(errorMessageFallback);
							}
						}
					},
					error: (error: unknown) => {
						console.log(':( transaction failed');
						setStatus?.(':( transaction failed');
						console.error('ERROR:', error);
						onFailed((error as any)?.toString?.() || errorMessageFallback);
					}
				});
			} catch (error) {
				console.log(':( transaction failed');
				setStatus?.(':( transaction failed');
				console.error('ERROR:', error);
				onFailed((error as any)?.toString?.() || errorMessageFallback);
			}
		} else if (wallet === EWallet.POLKADOT_VAULT) {
			const vaultSigner = new VaultQrSigner(setVaultQrState);

			const signer = getPolkadotSignerFromPjs(address, vaultSigner.signPayload as any, async (payload) => {
				return new Promise((resolve, reject) => {
					const data = u8aToU8a(payload.data);
					const isQrHashed = data.length > 5000;
					const qrPayload = isQrHashed ? blake2AsU8a(data) : data;
					setVaultQrState({
						open: true,
						isQrHashed,
						qrAddress: payload.address,
						qrPayload,
						qrResolve: resolve,
						qrReject: reject
					});
				});
			});

			tx.signSubmitAndWatch(signer).subscribe({
				next: async (event) => {
					// evt: { type, txHash, ... }
					if (event.type === 'signed') {
						setStatus?.('Transaction is ready');
						return;
					}
					if (event.type === 'broadcasted') {
						setStatus?.('Transaction has been broadcasted');
						onBroadcast?.();
						return;
					}
					if (event.type === 'txBestBlocksState') {
						if (event.found && event.ok && !waitTillFinalizedHash) {
							setStatus?.('Transaction is in block');
							await onSuccess(event.txHash);
						}
						if (event.found && !event.ok) {
							setStatus?.('Transaction failed');
							onFailed(errorMessageFallback);
						}
						return;
					}
					if (event.type === 'finalized') {
						setStatus?.('Transaction finalized');
						setIsTxFinalized?.(event.txHash);
						if (event.ok) {
							await onSuccess(event.txHash);
						} else {
							onFailed(errorMessageFallback);
						}
					}
				},
				error: (error: unknown) => {
					console.log(':( transaction failed');
					setStatus?.(':( transaction failed');
					console.error('ERROR:', error);
					onFailed((error as any)?.toString?.() || errorMessageFallback);
				}
			});
		} else {
			const injected = await getInjectedWallet(wallet);

			if (!injected) {
				console.log('Signer not set, Please refresh and try again');
				onFailed('Signer not set, Please refresh and try again');
				return;
			}

			// this.setSigner(injected.signer as Signer);

			const signer = getPolkadotSignerFromPjs(address, injected.signer.signPayload as any, injected.signer.signRaw as any);

			let extrinsic = tx;

			// for pure proxy accounts, we need to get the multisig account
			const getMultisigAccount = (account?: ISelectedAccount): ISelectedAccount | null => {
				if (!account) return null;
				if (account.accountType === EAccountType.MULTISIG) {
					return account;
				}

				if (account.parent) {
					return getMultisigAccount(account.parent);
				}

				return null;
			};

			const multisigAccount = getMultisigAccount(selectedAccount);

			if (selectedAccount?.accountType === EAccountType.PROXY) {
				extrinsic = this.api.tx.Proxy.proxy({
					real: MultiAddress.Id(selectedAccount.address),
					force_proxy_type: undefined,
					call: tx.decodedCall
				});
			}

			if (multisigAccount) {
				const signatories = multisigAccount?.signatories
					?.map((signatory) => getEncodedAddress(signatory, this.network))
					.filter((signatory) => signatory !== address)
					.filter((signatory) => signatory !== null);
				const { weight } = await extrinsic.getPaymentInfo(address);

				if (signatories && signatories?.length > 0 && multisigAccount?.threshold) {
					extrinsic = this.api.tx.Multisig.as_multi({
						threshold: multisigAccount?.threshold,
						other_signatories: signatories as string[],
						call: tx.decodedCall,
						maybe_timepoint: undefined,
						max_weight: weight
					});
				}
			}

			// const signerOptions = {
			// ...params,
			// withSignedTransaction: true
			// };

			extrinsic
				// eslint-disable-next-line sonarjs/cognitive-complexity
				.signSubmitAndWatch(signer)
				.subscribe({
					next: async (event) => {
						// evt: { type, txHash, ... }
						if (event.type === 'signed') {
							setStatus?.('Transaction is ready');
							return;
						}
						if (event.type === 'broadcasted') {
							setStatus?.('Transaction has been broadcasted');
							onBroadcast?.();
							return;
						}
						if (event.type === 'txBestBlocksState') {
							if (event.found && event.ok && !waitTillFinalizedHash) {
								setStatus?.('Transaction is in block');
								await onSuccess(event.txHash);
							}
							if (event.found && !event.ok) {
								setStatus?.('Transaction failed');
								onFailed(errorMessageFallback);
							}
							return;
						}
						if (event.type === 'finalized') {
							setStatus?.('Transaction finalized');
							setIsTxFinalized?.(event.txHash);
							if (event.ok) {
								await onSuccess(event.txHash);
							} else {
								onFailed(errorMessageFallback);
							}
						}
					},
					error: (error: unknown) => {
						console.log(':( transaction failed');
						setStatus?.(':( transaction failed');
						console.error('ERROR:', error);
						onFailed((error as any)?.toString?.() || errorMessageFallback);
					}
				});
		}
	}

	async getGenesisHash() {
		const { genesisHash } = await this.client.getChainSpecData();
		return genesisHash;
	}

	getCurrentRpcIndex(): number {
		return this.currentRpcEndpointIndex;
	}

	async getBlockHeight(): Promise<number> {
		const header = await this.relayClient.getBlockHeader();
		return header.number;
	}

	async keepAlive(): Promise<void> {
		await this.getBlockHeight();
	}

	async disconnect(): Promise<void> {
		this.client.destroy();
		this.relayClient.destroy();
	}

	async getExistentialDeposit() {
		if (!this.api) return new BN(0);
		return this.api.constants.Balances.ExistentialDeposit;
	}

	async getUserBalances({ address }: { address: string }) {
		let freeBalance = BN_ZERO;
		let lockedBalance = BN_ZERO;
		let totalBalance = BN_ZERO;
		let transferableBalance = BN_ZERO;

		const responseObj = {
			freeBalance,
			lockedBalance,
			totalBalance,
			transferableBalance
		};

		if (!address) {
			return responseObj;
		}

		const existentialDeposit = this.api.constants?.Balances?.ExistentialDeposit ? new BN(this.api.constants.Balances.ExistentialDeposit.toString()) : BN_ZERO;

		const encodedAddress = getEncodedAddress(address, this.network) || address;
		// await this.api.derive.balances
		// .all(encodedAddress)
		// .then((result) => {
		// lockedBalance = new BN(result.lockedBalance || lockedBalance);
		// })
		// .catch(() => {
		// // TODO: show notification
		// });

		await this.api.query.System.Account.getValue(encodedAddress)
			.then((result) => {
				const free = new BN(result?.data?.free.toString()) || BN_ZERO;
				const reserved = new BN(result?.data?.reserved.toString()) || BN_ZERO;
				// const frozen = new BN(result?.data?.frozen || result?.data?.feeFrozen || result?.data?.miscFrozen) || BN_ZERO;
				const frozen = new BN(result?.data?.frozen.toString()) || BN_ZERO;

				totalBalance = free.add(reserved);
				freeBalance = free;

				lockedBalance = reserved;

				const frozenMinusReserved = frozen.sub(reserved);
				transferableBalance = BN.max(free.sub(BN.max(frozenMinusReserved, existentialDeposit)), BN_ZERO);
			})
			.catch(() => {
				// TODO: show notification
			});

		return {
			freeBalance,
			lockedBalance,
			totalBalance,
			transferableBalance
		};
	}

	async voteReferendum({
		address,
		wallet,
		setVaultQrState,
		onSuccess,
		onFailed,
		referendumId,
		vote,
		lockedBalance,
		conviction,
		ayeVoteValue,
		nayVoteValue,
		abstainVoteValue,
		selectedAccount
	}: {
		address: string;
		wallet: EWallet;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		referendumId: number;
		vote: EVoteDecision;
		lockedBalance?: BN;
		conviction: number;
		ayeVoteValue?: BN;
		nayVoteValue?: BN;
		abstainVoteValue?: BN;
		selectedAccount?: ISelectedAccount;
	}) {
		let voteTx: Transaction<any, any, any, any> | null = null;

		if ([EVoteDecision.AYE, EVoteDecision.NAY].includes(vote) && lockedBalance) {
			voteTx = this.api.tx.ConvictionVoting.vote({
				poll_index: referendumId,
				vote: {
					type: 'Standard',
					value: {
						// AYE: conviction + 128, NAY: conviction + 0
						vote: vote === EVoteDecision.AYE ? conviction + 128 : conviction,
						balance: BigInt(lockedBalance.toString())
					}
				}
			});
		} else if (vote === EVoteDecision.SPLIT) {
			voteTx = this.api.tx.ConvictionVoting.vote({
				poll_index: referendumId,
				vote: { type: 'Split', value: { aye: BigInt(ayeVoteValue?.toString() || '0'), nay: BigInt(nayVoteValue?.toString() || '0') } }
			});
		} else if (vote === EVoteDecision.SPLIT_ABSTAIN && ayeVoteValue && nayVoteValue) {
			voteTx = this.api.tx.ConvictionVoting.vote({
				poll_index: referendumId,
				vote: {
					type: 'SplitAbstain',
					value: { abstain: BigInt(abstainVoteValue?.toString() || '0'), aye: BigInt(ayeVoteValue?.toString() || '0'), nay: BigInt(nayVoteValue?.toString() || '0') }
				}
			});
		}

		if (voteTx) {
			await this.executeTx({
				tx: voteTx,
				address,
				wallet,
				errorMessageFallback: 'Failed to vote',
				waitTillFinalizedHash: true,
				onSuccess,
				onFailed,
				selectedAccount,
				setVaultQrState
			});
		}
	}

	async remark({
		address,
		wallet,
		setVaultQrState,
		onSuccess,
		onFailed
	}: {
		address: string;
		wallet: EWallet;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
	}) {
		const remarkTx: Transaction<any, any, any, any> | null = this.api.tx.System.remark({ remark: Binary.fromText('test-papi-assethub-polkadot') });

		if (remarkTx) {
			await this.executeTx({
				tx: remarkTx,
				address,
				wallet,
				errorMessageFallback: 'Failed to vote',
				waitTillFinalizedHash: true,
				onSuccess,
				onFailed,
				setVaultQrState
			});
		}
	}

	async removeReferendumVote({
		address,
		referendumId,
		wallet,
		onSuccess,
		onFailed,
		selectedAccount,
		setVaultQrState
	}: {
		address: string;
		referendumId: number;
		wallet: EWallet;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		selectedAccount?: ISelectedAccount;
	}) {
		if (!this.api) {
			onFailed('API not ready – unable to remove vote');
			return;
		}

		try {
			const tx = this.api.tx.ConvictionVoting.remove_vote({
				index: referendumId,
				class: undefined
			});

			await this.executeTx({
				tx,
				address,
				wallet,
				errorMessageFallback: 'Failed to remove vote',
				waitTillFinalizedHash: true,
				onSuccess,
				onFailed,
				selectedAccount,
				setVaultQrState
			});
		} catch (error: unknown) {
			onFailed((error as Error)?.message || 'Failed to remove vote');
		}
	}

	async batchVoteReferendum({
		address,
		voteCartItems,
		wallet,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		voteCartItems: IVoteCartItem[];
		wallet: EWallet;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
	}) {
		if (!this.api) return;

		const voteTxList = voteCartItems.map((voteCartItem) => {
			let voteTx = null;
			const vote = voteCartItem.decision;
			const ayeVoteValue = voteCartItem.amount.aye;
			const nayVoteValue = voteCartItem.amount.nay;
			const abstainVoteValue = voteCartItem.amount.abstain;
			const referendumId = Number(voteCartItem.postIndexOrHash);
			const { conviction } = voteCartItem;
			if ([EVoteDecision.AYE, EVoteDecision.NAY].includes(vote) && (ayeVoteValue || nayVoteValue)) {
				voteTx = this.api.tx.ConvictionVoting.vote({
					poll_index: referendumId,
					vote: {
						type: 'Standard',
						value: {
							// AYE: conviction + 128, NAY: conviction + 0
							vote: vote === EVoteDecision.AYE ? conviction + 128 : conviction,
							balance: BigInt(ayeVoteValue?.toString() || '0')
						}
					}
				});
			} else if (vote === EVoteDecision.SPLIT) {
				voteTx = this.api.tx.ConvictionVoting.vote({
					poll_index: referendumId,
					vote: {
						type: 'Split',
						value: { aye: BigInt(ayeVoteValue?.toString() || '0'), nay: BigInt(nayVoteValue?.toString() || '0') }
					}
				});
			} else if (vote === EVoteDecision.SPLIT_ABSTAIN && ayeVoteValue && nayVoteValue) {
				voteTx = this.api.tx.ConvictionVoting.vote({
					poll_index: referendumId,
					vote: {
						type: 'SplitAbstain',
						value: { abstain: BigInt(abstainVoteValue?.toString() || '0'), aye: BigInt(ayeVoteValue?.toString() || '0'), nay: BigInt(nayVoteValue?.toString() || '0') }
					}
				});
			}
			if (voteTx) {
				return voteTx;
			}
			return null;
		});

		const tx = this.api.tx.Utility.batch_all({ calls: voteTxList.filter((t) => t !== null) as unknown as TxCallData[] });
		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to batch vote',
			waitTillFinalizedHash: true,
			onSuccess,
			onFailed,
			setVaultQrState
		});
	}

	private papiTypeToTypeDef(entry: any): TypeDef {
		switch (entry.type) {
			case 'primitive':
				return {
					info: TypeDefInfo.Plain,
					type: entry.value
				};
			case 'compact':
				return {
					info: TypeDefInfo.Compact,
					type: 'Compact',
					sub: {
						info: TypeDefInfo.Plain,
						type: entry.size || 'u128'
					}
				};
			case 'sequence': {
				const sub = this.papiTypeToTypeDef(entry.value);
				return {
					info: TypeDefInfo.Vec,
					// Explicitly check for u8 to map to Vec<u8>, which Param.tsx recognizes as Bytes
					type: sub.type === 'u8' ? 'Vec<u8>' : 'Vec',
					sub
				};
			}
			case 'array':
				return {
					info: TypeDefInfo.VecFixed,
					type: 'VecFixed',
					length: entry.len,
					sub: this.papiTypeToTypeDef(entry.value)
				};
			case 'tuple':
				return {
					info: TypeDefInfo.Tuple,
					type: 'Tuple',
					sub: entry.value.map((e: any) => this.papiTypeToTypeDef(e))
				};
			case 'struct':
				return {
					info: TypeDefInfo.Struct,
					type: 'Struct',
					sub: Object.entries(entry.value).map(([name, e]) => ({
						name,
						...this.papiTypeToTypeDef(e)
					}))
				};
			case 'enum':
				return {
					info: TypeDefInfo.Enum,
					type: 'Enum',
					sub: Object.entries(entry.value)
						.sort(([, a]: [string, any], [, b]: [string, any]) => a.idx - b.idx)
						.map(([name, variant]: [string, any]) => {
							const common = { name, index: variant.idx };
							// eslint-disable-next-line sonarjs/no-nested-switch
							switch (variant.type) {
								case 'void':
									return { ...common, info: TypeDefInfo.Plain, type: 'Null' };
								case 'lookupEntry':
									return {
										...common,
										info: TypeDefInfo.Tuple,
										sub: [this.papiTypeToTypeDef(variant.value)]
									};
								case 'tuple':
									return {
										...common,
										info: TypeDefInfo.Tuple,
										sub: variant.value.map((e: any) => this.papiTypeToTypeDef(e))
									};
								case 'struct':
									return {
										...common,
										info: TypeDefInfo.Struct,
										sub: Object.entries(variant.value).map(([n, e]: [string, any]) => ({
											name: n,
											...this.papiTypeToTypeDef(e)
										}))
									};
								default:
									return { ...common, info: TypeDefInfo.Plain, type: 'Unknown' };
							}
						}) as TypeDef[]
				};
			case 'option':
				return {
					info: TypeDefInfo.Option,
					type: 'Option',
					sub: this.papiTypeToTypeDef(entry.value)
				};
			case 'result':
				return {
					info: TypeDefInfo.Result,
					type: 'Result',
					sub: [
						{ name: 'Ok', ...this.papiTypeToTypeDef(entry.value.ok) },
						{ name: 'Err', ...this.papiTypeToTypeDef(entry.value.ko) }
					]
				};
			case 'bitSequence':
				return {
					info: TypeDefInfo.Plain,
					type: 'BitVec'
				};
			case 'AccountId32':
				return {
					info: TypeDefInfo.Plain,
					type: 'AccountId32'
				};
			case 'AccountId20':
				return {
					info: TypeDefInfo.Plain,
					type: 'AccountId20'
				};
			case 'void':
				return { info: TypeDefInfo.Null, type: 'Null' };
			default:
				return {
					info: TypeDefInfo.Plain,
					type: (entry as any).type || 'Unknown'
				};
		}
	}

	getApiSectionOptions() {
		if (!this.unifiedMetadata) {
			return [];
		}

		return this.unifiedMetadata.pallets
			.filter((p) => p.calls)
			.map((p) => ({
				label: p.name,
				text: p.name,
				value: p.name
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}

	getApiMethodOptions({ sectionName }: { sectionName: string }) {
		if (!this.unifiedMetadata || !this.lookup) {
			return [];
		}

		const pallet = this.unifiedMetadata.pallets.find((p) => p.name === sectionName);
		if (!pallet || !pallet.calls) {
			return [];
		}

		const callsLookup = this.lookup(pallet.calls.type);
		if (callsLookup.type !== 'enum') {
			return [];
		}

		return Object.keys(callsLookup.value)
			.sort()
			.map((name) => ({
				label: name,
				text: name,
				value: name
			}));
	}

	getPreimageParams({ extrinsicFn }: { extrinsicFn: Transaction<any, any, any, any> }) {
		console.log('extrinsicFn', extrinsicFn);
		console.log('unifiedMetadata', this.unifiedMetadata);
		console.log('lookup', this.lookup);
		if (!this.unifiedMetadata || !this.lookup || !extrinsicFn || !extrinsicFn.decodedCall) {
			return [];
		}

		const sectionName = extrinsicFn.decodedCall.type;
		const methodName = extrinsicFn.decodedCall.value.type;

		console.log('sectionName', sectionName);
		console.log('methodName', methodName);

		const pallet = this.unifiedMetadata.pallets.find((p) => p.name === sectionName);
		console.log('pallet', pallet);
		if (!pallet || !pallet.calls) {
			return [];
		}

		const callsLookup = this.lookup(pallet.calls.type);
		console.log('callsLookup', callsLookup);
		if (callsLookup.type !== 'enum') {
			return [];
		}

		const variant = callsLookup.value[`${methodName}`];
		console.log('variant', variant);
		if (!variant) {
			return [];
		}

		if (variant.type === 'struct') {
			return Object.entries(variant.value).map(([name, entry]) => ({
				name,
				type: this.papiTypeToTypeDef(entry)
			}));
		}
		if (variant.type === 'tuple') {
			return variant.value.map((entry: any, idx: number) => ({
				name: idx.toString(),
				type: this.papiTypeToTypeDef(entry)
			}));
		}
		if (variant.type === 'lookupEntry') {
			return [
				{
					name: 'arg',
					type: this.papiTypeToTypeDef(variant.value)
				}
			];
		}

		return [];
	}

	getPreimageParamsFromTypeDef({ type }: { type: TypeDef }) {
		if (!this.api) {
			return [];
		}
		// PAPI types are already fully resolved in papiTypeToTypeDef, so no registry lookup is needed.
		return type.sub
			? (Array.isArray(type.sub) ? type.sub : [type.sub]).map(
					(td): IParamDef => ({
						name: td.name || '',
						type: td as TypeDef,
						length: type.length
					})
				)
			: [];
	}

	getPreimageTx({ sectionName, methodName }: { sectionName: string; methodName: string }) {
		if (!this.api) {
			return null;
		}
		return (this.api.tx as any)[`${sectionName}`][`${methodName}`];
	}

	getPreimageCallableTx({ sectionName, methodName, paramsValues }: { sectionName: string; methodName: string; paramsValues: unknown[] }) {
		if (!this.api) {
			return null;
		}
		return (this.api.tx as any)[`${sectionName}`][`${methodName}`](...paramsValues);
	}

	getPreimageTxDetails({ extrinsicFn }: { extrinsicFn: Transaction<any, any, any, any> }) {
		if (!this.api || !extrinsicFn || !extrinsicFn.decodedCall || !extrinsicFn.decodedCall.value?.value) {
			return null;
		}

		console.log('extrinsicFn', extrinsicFn);

		const tx = this.api.tx.Balances.transfer_keep_alive({ dest: MultiAddress.Id(''), value: BigInt('1000000000000000000') });
		console.log('tx', tx);

		try {
			const encoded = extrinsicFn.getEncodedData(this.compatibilityToken);
			console.log('encoded', encoded);
			const u8a = encoded.asBytes();
			console.log('u8a', u8a);
			const preimageHash = blake2AsHex(u8a);
			const preimageLength = u8a.length;

			console.log('preimageHash', preimageHash);
			console.log('preimageLength', preimageLength);

			const decoded = extrinsicFn.decodedCall;
			const inspect = {
				section: decoded.type,
				method: decoded.value.type,
				args: decoded.value.value
			};

			console.log('preimageHash', preimageHash);
			console.log('inspect', inspect);

			return {
				preimageHash,
				inspect,
				preimage: u8aToHex(u8a),
				preimageLength
			};
		} catch (error) {
			console.error('ERROR:', error);
			return {
				preimageHash: '',
				inspect: null,
				preimage: '',
				preimageLength: 0
			};
		}
	}

	async getPreimageLengthFromPreimageHash({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash || !ValidatorService.isValidPreimageHash(preimageHash)) {
			return null;
		}
		const statusFor = await this.api.query.Preimage.StatusFor.getValue(Binary.fromHex(preimageHash));
		const requestStatusFor = await this.api.query.Preimage.RequestStatusFor.getValue(Binary.fromHex(preimageHash));

		const status = statusFor || requestStatusFor;

		if (!status) return null;
		return Number((status.value as any)?.len);
	}

	// create proposal calls

	getBatchAllTx(calls: Transaction<any, any, any, any>[] | null) {
		if (!this.api || !calls?.length) {
			return null;
		}
		return this.api.tx.Utility.batch_all({ calls: calls.map((t) => t.decodedCall) });
	}

	getNotePreimageTx({ extrinsicFn }: { extrinsicFn?: Transaction<any, any, any, any> | null }) {
		if (
			!this.api ||
			!extrinsicFn ||
			!extrinsicFn.decodedCall ||
			!extrinsicFn.decodedCall.value?.value ||
			(Array.isArray(extrinsicFn.decodedCall.value.value) && extrinsicFn.decodedCall.value.value.length === 0)
		) {
			return null;
		}
		try {
			return this.api.tx.Preimage.note_preimage({ bytes: extrinsicFn.getEncodedData(this.compatibilityToken) });
		} catch (error) {
			console.error('ERROR:', error);
			return null;
		}
	}

	getUnnotePreimageTx({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash) {
			return null;
		}
		return this.api.tx.Preimage.unnote_preimage({ hash: Binary.fromHex(preimageHash) });
	}

	getUnRequestPreimageTx({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash) {
			return null;
		}
		return this.api.tx.Preimage.unrequest_preimage({ hash: Binary.fromHex(preimageHash) });
	}

	async notePreimage({
		address,
		wallet,
		selectedAccount,
		extrinsicFn,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		selectedAccount?: ISelectedAccount;
		extrinsicFn: Transaction<any, any, any, any>;
		onSuccess?: () => void;
		onFailed?: () => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) {
			return;
		}

		const notePreimageTx = this.getNotePreimageTx({ extrinsicFn });
		if (!notePreimageTx) {
			onFailed?.();
			return;
		}
		await this.executeTx({
			tx: notePreimageTx,
			address,
			wallet,
			selectedAccount,
			setVaultQrState,
			errorMessageFallback: 'Failed to note preimage',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: () => {
				onFailed?.();
			}
		});
	}

	async unnotePreimage({
		address,
		wallet,
		preimageHash,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		preimageHash: string;
		onSuccess?: () => void;
		onFailed?: () => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) {
			return;
		}

		const unnotePreimageTx = this.getUnnotePreimageTx({ preimageHash });
		if (!unnotePreimageTx) {
			onFailed?.();
			return;
		}
		await this.executeTx({
			tx: unnotePreimageTx,
			address,
			wallet,
			errorMessageFallback: 'Failed to unnote preimage',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: () => {
				onFailed?.();
			},
			setVaultQrState
		});
	}

	async unRequestPreimage({
		address,
		wallet,
		preimageHash,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		preimageHash: string;
		onSuccess?: () => void;
		onFailed?: () => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) {
			return;
		}

		const unRequestPreimageTx = this.getUnRequestPreimageTx({ preimageHash });
		if (!unRequestPreimageTx) {
			onFailed?.();
			return;
		}
		await this.executeTx({
			tx: unRequestPreimageTx,
			address,
			wallet,
			errorMessageFallback: 'Failed to unrequest preimage',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: () => {
				onFailed?.();
			},
			setVaultQrState
		});
	}

	getSubmitProposalTx({
		track,
		preimageHash,
		preimageLength,
		enactment,
		enactmentValue
	}: {
		track: EPostOrigin;
		preimageHash: string;
		preimageLength: number;
		enactment: EEnactment;
		enactmentValue: BN;
	}) {
		if (!this.api || !track || !preimageHash || !preimageLength || !enactmentValue) {
			return null;
		}

		const isRoot = track === EPostOrigin.ROOT;
		return this.api.tx.Referenda.submit({
			proposal_origin: isRoot ? { type: 'system', value: { type: 'Root', value: undefined } } : { type: 'Origins', value: { type: track as any, value: undefined } },
			proposal: {
				type: 'Lookup',
				value: {
					hash: Binary.fromHex(preimageHash),
					len: preimageLength
				}
			},
			enactment_moment: enactmentValue
				? enactment === EEnactment.At_Block_No
					? { type: 'At', value: Number(enactmentValue) }
					: { type: 'After', value: Number(enactmentValue) }
				: { type: 'After', value: 100 }
		});
	}

	getTreasurySpendLocalExtrinsic({ beneficiaries }: { beneficiaries: IBeneficiaryInput[] }) {
		if (!this.api) {
			return null;
		}
		const tx: Transaction<any, any, any, any>[] = [];

		beneficiaries.forEach((beneficiary) => {
			if (ValidatorService.isValidAmount(beneficiary.amount) && ValidatorService.isValidSubstrateAddress(beneficiary.address)) {
				tx.push(
					this.api.tx.Treasury?.spend_local({
						amount: BigInt(beneficiary.amount),
						beneficiary: MultiAddress.Id(beneficiary.address)
					})
				);
			}
		});

		if (tx.length === 0) return null;

		if (tx.length === 1) return tx[0];

		return this.api.tx.Utility.batch_all({ calls: tx.map((t) => t.decodedCall) }) as Transaction<any, any, any, any>;
	}

	getTreasurySpendExtrinsic({ beneficiaries }: { beneficiaries: IBeneficiaryInput[] }) {
		if (!this.api) {
			return null;
		}
		const tx: Transaction<any, any, any, any>[] = [];

		// After AssetHub migration, these networks execute treasury calls FROM AssetHub
		const isPostMigration = isAHMNetwork(this.network);

		beneficiaries.forEach((beneficiary) => {
			if (ValidatorService.isValidAmount(beneficiary.amount) && ValidatorService.isValidSubstrateAddress(beneficiary.address)) {
				const validFrom = beneficiary.validFromBlock ? Number(beneficiary.validFromBlock) : undefined;
				const beneficiaryId = Binary.fromBytes(decodeAddress(beneficiary.address));

				if (beneficiary.assetId && ValidatorService.isValidAssetId(beneficiary.assetId, this.network)) {
					tx.push(
						this.api.tx.Treasury.spend({
							asset_kind: {
								type: 'V3',
								value: {
									asset_id: {
										type: 'Concrete',
										value: {
											parents: 0,
											interior: {
												type: 'X2',
												value: [
													{
														type: 'PalletInstance',
														value: Number(NETWORKS_DETAILS[this.network]?.palletInstance)
													},
													{
														type: 'GeneralIndex',
														value: BigInt(beneficiary.assetId)
													}
												]
											}
										}
									},
									location: isPostMigration
										? {
												parents: 0,
												interior: { type: 'Here', value: undefined }
											}
										: {
												parents: 0,
												interior: {
													type: 'X1',
													value: { type: 'Parachain', value: Number(NETWORKS_DETAILS[this.network]?.assetHubParaId) }
												}
											}
								}
							},
							amount: BigInt(beneficiary.amount),
							beneficiary: {
								type: 'V4',
								value: {
									account_id: {
										parents: 0,
										interior: {
											type: 'X1',
											value: {
												type: 'AccountId32',
												value: {
													id: beneficiaryId,
													network: undefined
												}
											}
										}
									},
									location: {
										parents: 0,
										interior: { type: 'Here', value: undefined }
									}
								}
							},
							// : {
							// type: 'V3',
							// value: {
							// parents: 0,
							// interior: {
							// type: 'X1',
							// value: {
							// type: 'AccountId32',
							// value: { id: beneficiaryId, network: undefined }
							// }
							// }
							// }
							// },
							valid_from: validFrom
						})
					);
				}
			}
		});

		if (tx.length === 0) return null;

		if (tx.length === 1) return tx[0];

		return this.api.tx.Utility.batch_all({ calls: tx.map((t) => t.decodedCall) });
	}

	getCancelReferendumExtrinsic({ referendumId }: { referendumId: number }) {
		if (!this.api) return null;
		return this.api.tx.Referenda.cancel({ index: referendumId });
	}

	getKillReferendumExtrinsic({ referendumId }: { referendumId: number }) {
		if (!this.api) return null;
		return this.api.tx.Referenda.kill({ index: referendumId });
	}

	getProposeBountyTx({ bountyAmount }: { bountyAmount: BN }) {
		if (!this.api) return null;
		const title = 'Bounty';
		return this.api.tx.Bounties.propose_bounty({ value: BigInt(bountyAmount.toString()), description: Binary.fromText(title) });
	}

	async proposeBounty({
		bountyAmount,
		address,
		wallet,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		bountyAmount: BN;
		address: string;
		wallet: EWallet;
		onSuccess?: (bountyId: number) => void;
		onFailed?: () => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api || !address || !bountyAmount) return;

		const bountyId = Number(await this.api.query.Bounties.BountyCount.getValue());

		const tx = this.getProposeBountyTx({ bountyAmount });

		if (!tx) {
			onFailed?.();
			return;
		}

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to propose bounty',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.(bountyId);
			},
			onFailed: () => {
				onFailed?.();
			},
			setVaultQrState
		});
	}

	getApproveBountyTx({ bountyId }: { bountyId: number }) {
		if (!this.api) return null;
		return this.api.tx.Bounties.approve_bounty({ bounty_id: bountyId });
	}

	async createProposal({
		address,
		wallet,
		selectedAccount,
		extrinsicFn,
		track,
		enactment,
		enactmentValue,
		preimageHash,
		preimageLength,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		selectedAccount?: ISelectedAccount;
		track: EPostOrigin;
		enactment: EEnactment;
		enactmentValue: BN;
		extrinsicFn?: Transaction<any, any, any, any>;
		preimageHash?: string;
		preimageLength?: number;
		onSuccess?: (postId: number) => void;
		onFailed?: () => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		const tracks = Object.values(EPostOrigin);
		if (!tracks.includes(track as EPostOrigin)) {
			console.log('Invalid track', track);
			onFailed?.();
			return;
		}

		if (!extrinsicFn) {
			if (!preimageHash || !preimageLength) {
				onFailed?.();
				return;
			}

			const submitProposalTx = this.getSubmitProposalTx({
				track,
				preimageHash,
				preimageLength,
				enactment,
				enactmentValue
			});
			if (!submitProposalTx) {
				onFailed?.();
				return;
			}

			const postId = Number(await this.api.query.Referenda.ReferendumCount.getValue());
			await this.executeTx({
				tx: submitProposalTx,
				selectedAccount,
				address,
				wallet,
				errorMessageFallback: 'Failed to create treasury proposal',
				waitTillFinalizedHash: true,
				onSuccess: () => {
					onSuccess?.(postId);
				},
				onFailed: () => {
					onFailed?.();
				},
				setVaultQrState
			});

			return;
		}

		const preimageDetails = this.getPreimageTxDetails({ extrinsicFn });

		if (!preimageDetails || !address) {
			onFailed?.();
			return;
		}

		const notePreimageTx = extrinsicFn ? this.getNotePreimageTx({ extrinsicFn }) : null;
		const submitProposalTx = this.getSubmitProposalTx({
			track,
			preimageHash: preimageDetails.preimageHash,
			preimageLength: preimageDetails.preimageLength,
			enactment,
			enactmentValue
		});

		if (!submitProposalTx || !notePreimageTx) {
			onFailed?.();
			return;
		}

		const preimageExists = await this.getPreimageLengthFromPreimageHash({ preimageHash: preimageDetails.preimageHash });
		const tx = preimageExists ? submitProposalTx : this.getBatchAllTx([notePreimageTx, submitProposalTx]);

		if (!tx) {
			onFailed?.();
			return;
		}

		const postId = Number(await this.api.query.Referenda.ReferendumCount.getValue());
		await this.executeTx({
			tx,
			address,
			selectedAccount,
			wallet,
			errorMessageFallback: 'Failed to create treasury proposal',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.(postId);
			},
			onFailed: () => {
				onFailed?.();
			},
			setVaultQrState
		});
	}

	async getTotalActiveIssuance() {
		if (!this.api) return null;
		try {
			const totalIssuance = await this.api.query.Balances.TotalIssuance.getValue();
			const inactiveIssuance = await this.api.query.Balances.InactiveIssuance.getValue();

			if (!totalIssuance || !inactiveIssuance) {
				console.error('Failed to fetch issuance values');
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Failed to fetch issuance values');
			}

			return new BN(totalIssuance.toString()).sub(new BN(inactiveIssuance.toString()));
		} catch (error) {
			console.error('Error in getTotalActiveIssuance:', error);
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Failed to retrieve total active issuance');
		}
	}

	async getTxFee({ extrinsicFn, address }: { extrinsicFn: (Transaction<any, any, any, any> | null)[]; address: string }) {
		if (!this.api) {
			return null;
		}
		const fees = await Promise.all(extrinsicFn.filter((tx) => tx !== null).map((tx) => tx && tx.getPaymentInfo(address)));
		return fees.reduce((acc, fee) => acc.add(new BN(fee?.partial_fee || BN_ZERO)), BN_ZERO);
	}

	async getNativeTreasuryBalance(): Promise<BN> {
		const treasuryAddress = TREASURY_NETWORK_CONFIG[this.network]?.treasuryAccount;
		if (!treasuryAddress) {
			return BN_ZERO;
		}
		const nativeTokenData = await this.api?.query?.System?.Account?.getValue(treasuryAddress);
		return new BN(nativeTokenData?.data?.free || 0);
	}

	async delegate({
		address,
		wallet,
		delegateAddress,
		balance,
		conviction,
		tracks,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		delegateAddress: string;
		balance: BN;
		conviction: number;
		tracks: number[];
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const txs = tracks.map((track) =>
			this.api.tx.ConvictionVoting.delegate({
				class: track,
				to: MultiAddress.Id(delegateAddress),
				conviction: convictionMap[`${conviction as unknown as keyof typeof convictionMap}`],
				balance: BigInt(balance.toString())
			})
		);

		const tx = txs.length === 1 ? txs[0] : this.api.tx.Utility.batch_all({ calls: txs.map((t) => t.decodedCall) });

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to delegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	async undelegate({
		address,
		wallet,
		trackId,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		trackId: number;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const tx = this.api.tx.ConvictionVoting.undelegate({ class: trackId });

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to undelegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	async getDelegateTxFee({ address, tracks, conviction, balance }: { address: string; tracks: number[]; conviction: number; balance: BN }) {
		if (!this.api) return null;

		const txs = tracks.map((track) =>
			this.api.tx.ConvictionVoting.delegate({
				class: track,
				to: MultiAddress.Id(address),
				conviction: convictionMap[`${conviction as unknown as keyof typeof convictionMap}`],
				balance: BigInt(balance.toString())
			})
		);
		return this.getTxFee({ extrinsicFn: txs, address });
	}

	async getUndelegateTxFee({ address, trackId }: { address: string; trackId: number }) {
		if (!this.api) return null;

		const tx = this.api.tx.ConvictionVoting.undelegate({ class: trackId });
		return this.getTxFee({ extrinsicFn: [tx], address });
	}

	async getOngoingReferendaTally({ postIndex }: { postIndex: number }) {
		const referendumInfoOf = await this.api?.query?.Referenda?.ReferendumInfoFor?.getValue(postIndex);

		if (referendumInfoOf?.type !== 'Ongoing') return null;

		const { tally } = referendumInfoOf.value;

		return {
			aye: tally.ayes.toString(),
			nay: tally.nays.toString(),
			support: tally.support.toString()
		};
	}

	async getInactiveIssuance() {
		// Paseo logic needs to be implemented
		if (!this.api) {
			return null;
		}

		return this.api.query.Balances.InactiveIssuance.getValue();
	}

	async getTotalIssuance() {
		// Paseo logic needs to be implemented
		if (!this.api) {
			return null;
		}
		return this.api.query.Balances.TotalIssuance.getValue();
	}

	async submitDecisionDeposit({
		postId,
		address,
		wallet,
		selectedAccount,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		postId: number;
		address: string;
		wallet: EWallet;
		selectedAccount?: ISelectedAccount;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const tx = this.api.tx.Referenda.place_decision_deposit({ index: postId });
		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to submit decision deposit',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState,
			selectedAccount
		});
	}

	async getTreasurySpendsData() {
		if (!this.api) return null;

		const currentBlockHeight = await this.getBlockHeight();

		const proposals = await this.api?.query?.Treasury?.Spends.getEntries();

		const treasuryPendingSpends: IPayout[] = [];

		proposals?.forEach(({ keyArgs: [spendIndex], value: spendData }) => {
			if (spendIndex && spendData) {
				const expiresAt = Number(spendData.expire_at);
				const startsAt = Number(spendData.valid_from);

				if (new BN(currentBlockHeight).gt(new BN(startsAt)) && new BN(currentBlockHeight).lt(new BN(expiresAt)) && spendData.status.type === 'Pending') {
					const payout: IPayout = {
						treasurySpendIndex: Number(spendIndex),
						treasurySpendData: {
							beneficiary:
								getSubstrateAddressFromAccountId(
									(spendData as any)?.beneficiary?.V4?.interior?.X1?.[0]?.AccountId32?.id || (spendData as any)?.beneficiary?.V3?.interior?.X1?.AccountId32?.id || ''
								) || '',
							generalIndex:
								(
									(spendData as any)?.assetKind?.V4?.assetId?.interior?.X2?.[1]?.GeneralIndex ||
									(spendData as any)?.assetKind?.V3?.assetId?.Concrete.interior?.X2?.[1]?.GeneralIndex ||
									''
								)
									.split(',')
									?.join('') || '',
							amount: (spendData as any)?.amount?.toString()?.split(',')?.join('') || '',
							expiresAt: BlockCalculationsService.getDateFromBlockNumber({
								currentBlockNumber: new BN(currentBlockHeight),
								targetBlockNumber: new BN(expiresAt),
								network: this.network
							})
						}
					};
					treasuryPendingSpends.push(payout);
				}
			}
		});

		return treasuryPendingSpends;
	}

	async claimTreasuryPayout({
		payouts,
		address,
		wallet,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		payouts: IPayout[];
		address: string;
		wallet: EWallet;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api || !payouts || payouts.length === 0) return;

		const tx = payouts.map((p) => this.api.tx.Treasury.payout({ index: p.treasurySpendIndex }));

		const batchTx = tx.length > 1 ? this.api.tx.Utility.batch({ calls: tx.map((t) => t.decodedCall) }) : tx[0];

		await this.executeTx({
			tx: batchTx,
			address,
			wallet,
			errorMessageFallback: 'Failed to claim treasury payout',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	getTeleportToPeopleChainTx({ beneficiaryAddress, amount }: { beneficiaryAddress: string; amount: BN }) {
		if (!this.api) return null;

		return this.api.tx.PolkadotXcm.limited_teleport_assets({
			dest: {
				type: 'V3',
				value: {
					parents: 1,
					interior: {
						type: 'X1',
						value: {
							type: 'Parachain',
							value: Number(NETWORKS_DETAILS[this.network]?.peopleChainParaId)
						}
					}
				}
			},
			beneficiary: {
				type: 'V3',
				value: {
					parents: 0,
					interior: {
						type: 'X1',
						value: {
							type: 'AccountId32',
							value: {
								id: Binary.fromBytes(decodeAddress(beneficiaryAddress)),
								network: undefined
							}
						}
					}
				}
			},
			assets: {
				type: 'V3',
				value: [
					{
						fun: {
							type: 'Fungible',
							value: BigInt(amount.toString())
						},
						id: {
							type: 'Concrete',
							value: {
								interior: {
									type: 'Here',
									value: undefined
								},
								parents: 1
							}
						}
					}
				]
			},
			fee_asset_item: 0,
			weight_limit: {
				type: 'Unlimited',
				value: undefined
			}
		});
	}

	async teleportToPeopleChain({
		beneficiaryAddress,
		amount,
		address,
		wallet,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		beneficiaryAddress: string;
		amount: BN;
		address: string;
		wallet: EWallet;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const tx = this.getTeleportToPeopleChainTx({ beneficiaryAddress, amount });

		if (!tx) return;

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to teleport to people chain',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	async loginWithRemark({
		address,
		remarkLoginMessage,
		onSuccess,
		onFailed,
		wallet,
		setVaultQrState
	}: {
		address: string;
		remarkLoginMessage: string;
		onSuccess: (pre?: unknown) => void;
		onFailed: (error: string) => void;
		wallet: EWallet;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const tx = this.api.tx.System.remark({ remark: Binary.fromText(remarkLoginMessage) });

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to login with remark',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	async getAddressGovernanceLock({ address }: { address: string }): Promise<BN | null> {
		if (!this.api) return null;
		const locks: any = await this.api.query?.ConvictionVoting?.ClassLocksFor?.getValue(address);

		return locks.reduce((max: BN, rawLock: any) => {
			const locked = rawLock[1].toString();
			return new BN(locked).gt(max) ? new BN(locked) : max;
		}, BN_ZERO);
	}

	async getReferendaInfo({ postId }: { postId: number }) {
		if (!this.api) return null;
		const referendaInfo = await this.api.query.Referenda.ReferendumInfoFor.getValue(postId);

		const canRefundDecisionDeposit = !!(
			(referendaInfo?.type === 'Approved' && referendaInfo.value) ||
			(referendaInfo?.type === 'Cancelled' && referendaInfo.value) ||
			(referendaInfo?.type === 'Rejected' && referendaInfo.value) ||
			(referendaInfo?.type === 'TimedOut' && referendaInfo.value)
		);

		const canRefundSubmissionDeposit = !!(referendaInfo?.type === 'Approved' && referendaInfo.value) || (referendaInfo?.type === 'Cancelled' && referendaInfo.value);

		return {
			canRefundDecisionDeposit,
			canRefundSubmissionDeposit
		};
	}

	async refundDeposits({
		postId,
		address,
		canRefundDecisionDeposit,
		canRefundSubmissionDeposit,
		wallet,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		postId: number;
		address: string;
		canRefundDecisionDeposit: boolean;
		canRefundSubmissionDeposit: boolean;
		wallet: EWallet;
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) return;

		const refundDecisionDepositTx = this.api.tx.Referenda.refund_decision_deposit({ index: postId });
		const refundSubmissionDepositTx = this.api.tx.Referenda.refund_submission_deposit({ index: postId });

		let tx: Transaction<any, any, any, any>;

		if (canRefundDecisionDeposit && canRefundSubmissionDeposit) {
			tx = this.api.tx.Utility.batch_all({ calls: [refundDecisionDepositTx, refundSubmissionDepositTx].map((t) => t.decodedCall) });
		} else if (canRefundSubmissionDeposit) {
			tx = refundSubmissionDepositTx;
		} else {
			tx = refundDecisionDepositTx;
		}

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to refund deposits',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true,
			setVaultQrState
		});
	}

	private static mapIndividualProxies(proxyArray: any[]): IProxyAddress[] {
		return proxyArray
			.map((proxyEntry) => {
				const delayValue = proxyEntry?.delay || 0;
				if (!proxyEntry.delegate) {
					return undefined;
				}
				return {
					address: proxyEntry.delegate,
					proxyType: (proxyEntry?.proxy_type.type as EProxyType) || EProxyType.GOVERNANCE,
					delay: delayValue
				};
			})
			.filter((proxy) => proxy !== undefined) as IProxyAddress[];
	}

	private static processProxyInfo(delegator: string, proxyHuman: any): IProxyRequest | null {
		if (!proxyHuman || !Array.isArray(proxyHuman)) return null;
		const proxyArray = proxyHuman[0];
		if (!proxyArray || !Array.isArray(proxyArray) || proxyArray.length === 0) return null;

		const individualProxies = this.mapIndividualProxies(proxyArray);
		const firstProxyDelay = individualProxies[0]?.delay || 0;

		return {
			id: `${delegator}`,
			delegator,
			delay: firstProxyDelay,
			proxies: proxyArray.length,
			proxyAddresses: individualProxies.map((p) => p.address),
			individualProxies,
			dateCreated: new Date()
		};
	}

	async getProxyRequests({ page, limit, search }: { page: number; limit: number; search?: string }) {
		if (!this.api) return { items: [], totalCount: 0 };

		try {
			// Get all proxy entries from the chain
			const proxyEntries = await this.api.query.Proxy.Proxies.getEntries();
			const proxies: IProxyRequest[] = [];

			proxyEntries.forEach(({ keyArgs: [delegator], value: proxyData }) => {
				// Filter by search if provided
				if (search && !delegator.toLowerCase().includes(search.toLowerCase())) {
					return;
				}

				const proxyRequest = PolkadotApiService.processProxyInfo(delegator, proxyData);
				if (proxyRequest) proxies.push(proxyRequest);
			});

			// Deterministic ordering
			proxies.sort((a, b) => a.delegator.localeCompare(b.delegator));

			// Apply pagination
			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;
			const paginatedProxies = proxies.slice(startIndex, endIndex);

			return {
				items: paginatedProxies,
				totalCount: proxies.length
			};
		} catch {
			return { items: [], totalCount: 0 };
		}
	}

	async getMyProxies({ page, limit, userAddress }: { page: number; limit: number; search?: string; userAddress: string }) {
		if (!this.api) return { items: [], totalCount: 0 };

		try {
			// Get proxies for the specific user
			const proxyData = await this.api.query.Proxy.Proxies.getValue(userAddress);
			const proxies: IProxyRequest[] = [];

			const proxyRequest = PolkadotApiService.processProxyInfo(userAddress, proxyData);
			if (proxyRequest) proxies.push(proxyRequest);

			// Sort by date created (newest first)
			proxies.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());

			// Apply pagination
			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;
			const paginatedProxies = proxies.slice(startIndex, endIndex);

			return {
				items: paginatedProxies,
				totalCount: proxies.length
			};
		} catch {
			return { items: [], totalCount: 0 };
		}
	}

	async getAssethubTreasuryAssetsBalance(): Promise<{ [key: string]: BN }> {
		const assetIds = Object.keys(NETWORKS_DETAILS[this.network].supportedAssets || {});
		const treasuryAddress = TREASURY_NETWORK_CONFIG[this.network]?.assetHubTreasuryAddress;
		const balances: { [key: string]: BN } = {};

		if (!treasuryAddress) return balances;

		await Promise.all(
			assetIds.map(async (assetId) => {
				const data = await (this.api as unknown as TypedApi<IPapiAssetHubDescriptor>).query.Assets.Account.getValue(Number(assetId), treasuryAddress);
				balances[`${assetId}`] = new BN(data?.balance || '0');
			})
		);

		const nativeTokenData = await this.api.query.System.Account.getValue(treasuryAddress);
		if (nativeTokenData?.data?.free) {
			const freeTokenBalance = nativeTokenData.data.free;
			balances[`${NETWORKS_DETAILS[this.network].tokenSymbol}`] = new BN(freeTokenBalance);
		}

		return balances;
	}

	static async createNewAddress(): Promise<{ mnemonic: string; address: string }> {
		await cryptoWaitReady();
		const mnemonic = mnemonicGenerate();
		const keyring = new Keyring({ type: 'sr25519' });
		const pair = keyring.addFromUri(mnemonic);
		return { mnemonic, address: pair.address };
	}

	async delegateForDelegateX({
		address,
		wallet,
		delegateAddress,
		balance,
		conviction,
		tracks,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		delegateAddress: string;
		balance: BN;
		conviction: number;
		tracks: number[];
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) {
			onFailed('API not ready');
			return;
		}

		// Validate balance - cannot delegate zero balance
		if (!balance || balance.isZero()) {
			onFailed('Balance cannot be zero. Please specify a voting power amount.');
			return;
		}

		const feeAmount = inputToBn('5', this.network).bnValue;

		const feeTx = this.api.tx.Balances.transfer_keep_alive({ dest: MultiAddress.Id(delegateAddress), value: BigInt(feeAmount.toString()) });

		const txs = tracks.map((track) =>
			this.api.tx.ConvictionVoting.delegate({
				class: track,
				to: MultiAddress.Id(delegateAddress),
				conviction: convictionMap[`${conviction as unknown as keyof typeof convictionMap}`],
				balance: BigInt(balance.toString())
			})
		);

		const tx = this.api.tx.Utility.batch_all({ calls: [feeTx.decodedCall, ...txs.map((t) => t.decodedCall)] });

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to delegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: false,
			setVaultQrState
		});
	}

	async undelegateForDelegateX({
		address,
		wallet,
		tracks,
		onSuccess,
		onFailed,
		setVaultQrState
	}: {
		address: string;
		wallet: EWallet;
		tracks: number[];
		onSuccess: () => void;
		onFailed: (error: string) => void;
		setVaultQrState: Dispatch<SetStateAction<IVaultQrState>>;
	}) {
		if (!this.api) {
			onFailed('API not ready');
			return;
		}

		const txs = tracks.map((track) => this.api.tx.ConvictionVoting.undelegate({ class: track }));

		const tx = this.api.tx.Utility.batch_all({ calls: txs.map((t) => t.decodedCall) });

		await this.executeTx({
			tx,
			address,
			wallet,
			errorMessageFallback: 'Failed to undelegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: false,
			setVaultQrState
		});
	}
}
