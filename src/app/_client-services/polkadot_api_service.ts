// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Signer, ISubmittableResult, TypeDef } from '@polkadot/types/types';
import { BN, BN_HUNDRED, BN_ZERO, u8aToHex } from '@polkadot/util';
import { getTypeDef } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { EAccountType, EEnactment, ENetwork, EPostOrigin, EVoteDecision, IBeneficiaryInput, IParamDef, IPayout, ISelectedAccount, IVoteCartItem } from '@shared/types';
import { getSubstrateAddressFromAccountId } from '@/_shared/_utils/getSubstrateAddressFromAccountId';
import { BlockCalculationsService } from './block_calculations_service';

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

	private async executeTx({
		tx,
		address,
		params = {},
		errorMessageFallback,
		onSuccess,
		onFailed,
		onBroadcast,
		setStatus,
		setIsTxFinalized,
		waitTillFinalizedHash = false,
		selectedAccount
	}: {
		tx: SubmittableExtrinsic<'promise'>;
		address: string;
		params?: Record<string, unknown>;
		errorMessageFallback: string;
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		onBroadcast?: () => void;
		setStatus?: (pre: string) => void;
		setIsTxFinalized?: (pre: string) => void;
		waitTillFinalizedHash?: boolean;
		selectedAccount?: ISelectedAccount;
	}) {
		let isFailed = false;
		if (!this.api || !tx) return;

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
			extrinsic = this.api.tx.proxy.proxy(selectedAccount.address, null, extrinsic);
		}

		if (multisigAccount) {
			const signatories = multisigAccount?.signatories?.map((signatory) => getEncodedAddress(signatory, this.network)).filter((signatory) => signatory !== address);
			const { weight } = await extrinsic.paymentInfo(address);
			extrinsic = this.api.tx.multisig.asMulti(multisigAccount?.threshold, signatories, null, extrinsic, weight);
		}

		const signerOptions = {
			...params,
			withSignedTransaction: true
		};

		extrinsic
			// eslint-disable-next-line sonarjs/cognitive-complexity
			.signAndSend(address, signerOptions, async ({ status, events, txHash }) => {
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
		let transferableBalance = BN_ZERO;

		const responseObj = {
			freeBalance,
			lockedBalance,
			totalBalance,
			transferableBalance
		};

		if (!address || !this.api?.derive?.balances?.all) {
			return responseObj;
		}

		const existentialDeposit = this.api.consts?.balances?.existentialDeposit ? new BN(this.api.consts.balances.existentialDeposit.toString()) : BN_ZERO;

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
				const frozen = new BN(result?.data?.frozen || result?.data?.feeFrozen || result?.data?.miscFrozen) || BN_ZERO;

				totalBalance = free.add(reserved);
				freeBalance = free;

				if (free.gt(frozen)) {
					transferableBalance = free.sub(frozen);

					if (transferableBalance.lt(existentialDeposit)) {
						transferableBalance = BN_ZERO;
					}
				} else {
					transferableBalance = BN_ZERO;
				}
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
		onSuccess: (pre?: unknown) => Promise<void> | void;
		onFailed: (errorMessageFallback: string) => Promise<void> | void;
		referendumId: number;
		vote: EVoteDecision;
		lockedBalance?: BN;
		conviction?: number;
		ayeVoteValue?: BN;
		nayVoteValue?: BN;
		abstainVoteValue?: BN;
		selectedAccount?: ISelectedAccount;
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
				waitTillFinalizedHash: true,
				onSuccess,
				onFailed,
				selectedAccount
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

	getApiSectionOptions() {
		if (!this.api) {
			return [];
		}

		return Object.keys(this.api.tx)
			.sort()
			.filter((name) => Object.keys(this.api.tx[`${name}`]).length)
			.map((name) => ({
				label: name,
				text: name,
				value: name
			}));
	}

	getApiMethodOptions({ sectionName }: { sectionName: string }) {
		if (!this.api) {
			return [];
		}

		const section = this.api.tx[`${sectionName}`];

		if (!section || Object.keys(section)?.length === 0) {
			return [];
		}

		return Object.keys(section)
			.sort()
			.map((value) => {
				const method = section[`${value}`];
				const inputs = method.meta.args.map((arg: any) => arg.name.toString()).join(', ');
				return {
					label: `${value} (${inputs})`,
					text: value,
					value
				};
			});
	}

	getPreimageParams({ sectionName, methodName }: { sectionName: string; methodName: string }) {
		if (!this.api) {
			return [];
		}

		const submittable = this.api.tx[`${sectionName}`][`${methodName}`];

		if (!submittable) {
			return [];
		}

		return submittable.meta.args.map(
			({ name, type, typeName }): IParamDef => ({
				name: name.toString(),
				type: {
					...getTypeDef(type.toString()),
					...(typeName.isSome ? { typeName: typeName.unwrap().toString() } : {})
				}
			})
		);
	}

	getPreimageParamsFromTypeDef({ type }: { type: TypeDef }) {
		const registry = this.getApiRegistry();
		const typeDef = getTypeDef(registry.createType(type.type as 'u32').toRawType()) || type;

		return typeDef.sub
			? (Array.isArray(typeDef.sub) ? typeDef.sub : [typeDef.sub]).map(
					(td): IParamDef => ({
						name: td.name || '',
						type: td as TypeDef,
						length: typeDef.length
					})
				)
			: [];
	}

	getPreimageTx({ sectionName, methodName }: { sectionName: string; methodName: string }) {
		if (!this.api) {
			return null;
		}
		return this.api.tx[`${sectionName}`][`${methodName}`];
	}

	getPreimageCallableTx({ sectionName, methodName, paramsValues }: { sectionName: string; methodName: string; paramsValues: unknown[] }) {
		if (!this.api) {
			return null;
		}
		return this.api.tx[`${sectionName}`][`${methodName}`](...paramsValues);
	}

	getPreimageTxDetails({ extrinsicFn }: { extrinsicFn: SubmittableExtrinsic<'promise', ISubmittableResult> }) {
		if (!this.api) {
			return null;
		}

		const u8a = extrinsicFn.method.toU8a();
		const inspect = extrinsicFn.method.inspect();

		const encodedTx = extrinsicFn.method.toHex();

		const preimageLength = Math.ceil((encodedTx.length - 2) / 2);

		return {
			preimageHash: extrinsicFn.registry.hash(u8a).toHex(),
			inspect,
			preimage: u8aToHex(u8a),
			preimageLength
		};
	}

	async getPreimageLengthFromPreimageHash({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash || !ValidatorService.isValidPreimageHash(preimageHash)) {
			return null;
		}
		const statusFor = (await this.api.query.preimage.statusFor?.(preimageHash)) as any;
		const requestStatusFor = (await this.api.query.preimage.requestStatusFor?.(preimageHash)) as any;

		const status = statusFor?.isSome ? statusFor.unwrapOr(null) : requestStatusFor.unwrapOr(null);

		if (!status) return null;
		return Number(status.value?.len);
	}

	// create proposal calls

	getBatchAllTx(extrinsicFn: SubmittableExtrinsic<'promise', ISubmittableResult>[] | null) {
		if (!this.api || !extrinsicFn?.length) {
			return null;
		}
		return this.api.tx.utility.batchAll(extrinsicFn);
	}

	getNotePreimageTx({ extrinsicFn }: { extrinsicFn?: SubmittableExtrinsic<'promise', ISubmittableResult> | null }) {
		if (!this.api || !extrinsicFn) {
			return null;
		}
		const encodedTx = extrinsicFn.method.toHex();
		return this.api.tx.preimage.notePreimage(encodedTx);
	}

	getUnnotePreimageTx({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash) {
			return null;
		}
		return this.api.tx.preimage.unnotePreimage(preimageHash);
	}

	getUnRequestPreimageTx({ preimageHash }: { preimageHash: string }) {
		if (!this.api || !preimageHash) {
			return null;
		}
		return this.api.tx.preimage.unrequestPreimage(preimageHash);
	}

	async notePreimage({
		address,
		extrinsicFn,
		onSuccess,
		onFailed
	}: {
		address: string;
		extrinsicFn: SubmittableExtrinsic<'promise', ISubmittableResult>;
		onSuccess?: () => void;
		onFailed?: () => void;
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

	async unnotePreimage({ address, preimageHash, onSuccess, onFailed }: { address: string; preimageHash: string; onSuccess?: () => void; onFailed?: () => void }) {
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
			errorMessageFallback: 'Failed to unnote preimage',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: () => {
				onFailed?.();
			}
		});
	}

	async unRequestPreimage({ address, preimageHash, onSuccess, onFailed }: { address: string; preimageHash: string; onSuccess?: () => void; onFailed?: () => void }) {
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
			errorMessageFallback: 'Failed to unrequest preimage',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: () => {
				onFailed?.();
			}
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
		return this.api.tx.referenda.submit(
			isRoot ? { system: track } : { Origins: track },
			{ Lookup: { hash: preimageHash, len: String(preimageLength) } },
			enactmentValue ? (enactment === EEnactment.At_Block_No ? { At: enactmentValue } : { After: enactmentValue }) : { After: BN_HUNDRED }
		);
	}

	getTreasurySpendLocalExtrinsic({ beneficiaries }: { beneficiaries: IBeneficiaryInput[] }) {
		if (!this.api) {
			return null;
		}
		const tx: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

		beneficiaries.forEach((beneficiary) => {
			if (ValidatorService.isValidAmount(beneficiary.amount) && ValidatorService.isValidSubstrateAddress(beneficiary.address)) {
				tx.push(this.api.tx?.treasury?.spendLocal(beneficiary.amount.toString(), beneficiary.address));
			}
		});

		if (tx.length === 0) return null;

		if (tx.length === 1) return tx[0];

		return this.api.tx.utility.batchAll(tx);
	}

	getTreasurySpendExtrinsic({ beneficiaries }: { beneficiaries: IBeneficiaryInput[] }) {
		if (!this.api) {
			return null;
		}
		const tx: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

		beneficiaries.forEach((beneficiary) => {
			if (ValidatorService.isValidAmount(beneficiary.amount) && ValidatorService.isValidSubstrateAddress(beneficiary.address)) {
				if (beneficiary.assetId && ValidatorService.isValidAssetId(beneficiary.assetId, this.network)) {
					tx.push(
						this.api.tx?.treasury?.spend(
							{
								V3: {
									assetId: {
										Concrete: {
											parents: 0,
											interior: {
												X2: [
													{
														PalletInstance: NETWORKS_DETAILS[this.network]?.palletInstance
													},
													{
														GeneralIndex: beneficiary.assetId
													}
												]
											}
										}
									},
									location: {
										parents: 0,
										interior: {
											X1: { Parachain: NETWORKS_DETAILS[this.network]?.assetHubParaId }
										}
									}
								}
							},
							beneficiary.amount.toString(),
							{ V3: { parents: 0, interior: { X1: { AccountId32: { id: decodeAddress(beneficiary.address), network: null } } } } },
							beneficiary.validFromBlock || null
						)
					);
				} else {
					tx.push(
						this.api.tx?.treasury?.spend(
							{
								V4: {
									location: {
										parents: 0,
										interior: {
											X1: [
												{
													Parachain: NETWORKS_DETAILS[this.network]?.assetHubParaId
												}
											]
										}
									},
									assetId: {
										parents: 1,
										interior: 'here'
									}
								}
							},
							beneficiary.amount.toString(),
							{
								V4: {
									parents: 0,
									interior: {
										X1: [
											{
												AccountId32: {
													id: decodeAddress(beneficiary.address),
													network: null
												}
											}
										]
									}
								}
							},
							beneficiary.validFromBlock || null
						)
					);
				}
			}
		});

		if (tx.length === 0) return null;

		if (tx.length === 1) return tx[0];

		return this.api.tx.utility.batchAll(tx);
	}

	getCancelReferendumExtrinsic({ referendumId }: { referendumId: number }) {
		if (!this.api) return null;
		return this.api.tx.referenda.cancel(referendumId);
	}

	getKillReferendumExtrinsic({ referendumId }: { referendumId: number }) {
		if (!this.api) return null;
		return this.api.tx.referenda.kill(referendumId);
	}

	getProposeBountyTx({ bountyAmount }: { bountyAmount: BN }) {
		if (!this.api) return null;
		const title = 'Bounty';
		return this.api.tx.bounties.proposeBounty(bountyAmount, title);
	}

	async proposeBounty({ bountyAmount, address, onSuccess, onFailed }: { bountyAmount: BN; address: string; onSuccess?: (bountyId: number) => void; onFailed?: () => void }) {
		if (!this.api || !address || !bountyAmount) return;

		const bountyId = Number(await this.api.query.bounties.bountyCount());

		const tx = this.getProposeBountyTx({ bountyAmount });

		if (!tx) {
			onFailed?.();
			return;
		}

		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to propose bounty',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.(bountyId);
			},
			onFailed: () => {
				onFailed?.();
			}
		});
	}

	getApproveBountyTx({ bountyId }: { bountyId: number }) {
		if (!this.api) return null;
		return this.api.tx.bounties.approveBounty(bountyId);
	}

	async createProposal({
		address,
		extrinsicFn,
		track,
		enactment,
		enactmentValue,
		preimageHash,
		preimageLength,
		onSuccess,
		onFailed
	}: {
		address: string;
		track: EPostOrigin;
		enactment: EEnactment;
		enactmentValue: BN;
		extrinsicFn?: SubmittableExtrinsic<'promise', ISubmittableResult>;
		preimageHash?: string;
		preimageLength?: number;
		onSuccess?: (postId: number) => void;
		onFailed?: () => void;
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

			const postId = Number(await this.api.query.referenda.referendumCount());
			await this.executeTx({
				tx: submitProposalTx,
				address,
				errorMessageFallback: 'Failed to create treasury proposal',
				waitTillFinalizedHash: true,
				onSuccess: () => {
					onSuccess?.(postId);
				},
				onFailed: () => {
					onFailed?.();
				}
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

		const postId = Number(await this.api.query.referenda.referendumCount());
		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to create treasury proposal',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.(postId);
			},
			onFailed: () => {
				onFailed?.();
			}
		});
	}

	getApiRegistry() {
		return this.api?.registry;
	}

	async getCurrentBlockHeight() {
		if (!this.api) {
			return null;
		}
		return this.api.derive.chain.bestNumber();
	}

	async getTotalActiveIssuance() {
		if (!this.api) return null;
		try {
			const totalIssuance = await this.api.query.balances.totalIssuance();
			const inactiveIssuance = await this.api.query.balances.inactiveIssuance();

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

	async getTxFee({ extrinsicFn, address }: { extrinsicFn: (SubmittableExtrinsic<'promise', ISubmittableResult> | null)[]; address: string }) {
		if (!this.api) {
			return null;
		}
		const fees = await Promise.all(extrinsicFn.filter((tx) => tx !== null).map((tx) => tx && tx.paymentInfo(address)));
		return fees.reduce((acc, fee) => acc.add(new BN(fee?.partialFee || BN_ZERO)), BN_ZERO);
	}

	async getNativeTreasuryBalance(): Promise<BN> {
		const treasuryAddress = TREASURY_NETWORK_CONFIG[this.network]?.treasuryAccount;
		const nativeTokenData: any = await this.api?.query?.system?.account(treasuryAddress);
		return new BN(nativeTokenData?.data?.free.toBigInt() || 0);
	}

	async delegate({
		address,
		delegateAddress,
		balance,
		conviction,
		tracks,
		onSuccess,
		onFailed
	}: {
		address: string;
		delegateAddress: string;
		balance: BN;
		conviction: number;
		tracks: number[];
		onSuccess: () => void;
		onFailed: (error: string) => void;
	}) {
		if (!this.api) return;

		const txs = tracks.map((track) => this.api.tx.convictionVoting.delegate(track, delegateAddress, conviction, balance));

		const tx = txs.length === 1 ? txs[0] : this.api.tx.utility.batchAll(txs);

		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to delegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true
		});
	}

	async undelegate({ address, trackId, onSuccess, onFailed }: { address: string; trackId: number; onSuccess: () => void; onFailed: (error: string) => void }) {
		if (!this.api) return;

		const tx = this.api.tx.convictionVoting.undelegate(trackId);

		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to undelegate',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true
		});
	}

	async getDelegateTxFee({ address, tracks, conviction, balance }: { address: string; tracks: number[]; conviction: number; balance: BN }) {
		if (!this.api) return null;

		const txs = tracks.map((track) => this.api.tx.convictionVoting.delegate(track, address, conviction, balance));
		return this.getTxFee({ extrinsicFn: txs, address });
	}

	async getUndelegateTxFee({ address, trackId }: { address: string; trackId: number }) {
		if (!this.api) return null;

		const tx = this.api.tx.convictionVoting.undelegate(trackId);
		return this.getTxFee({ extrinsicFn: [tx], address });
	}

	async getOngoingReferendaTally({ postIndex }: { postIndex: number }) {
		const referendumInfoOf = await this.api?.query?.referenda?.referendumInfoFor(postIndex);
		const parsedReferendumInfo: any = referendumInfoOf?.toJSON();

		if (!parsedReferendumInfo?.ongoing?.tally) return null;

		return {
			aye:
				typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
					? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex')?.toString()
					: new BN(parsedReferendumInfo.ongoing.tally.ayes)?.toString(),
			nay:
				typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
					? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex')?.toString()
					: new BN(parsedReferendumInfo.ongoing.tally.nays)?.toString(),
			support:
				typeof parsedReferendumInfo.ongoing.tally.support === 'string'
					? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex')?.toString()
					: new BN(parsedReferendumInfo.ongoing.tally.support)?.toString()
		};
	}

	async getInactiveIssuance() {
		// Paseo logic needs to be implemented
		if (!this.api) {
			return null;
		}

		return this.api.query.balances.inactiveIssuance();
	}

	async getTotalIssuance() {
		// Paseo logic needs to be implemented
		if (!this.api) {
			return null;
		}
		return this.api.query.balances.totalIssuance();
	}

	async submitDecisionDeposit({ postId, address, onSuccess, onFailed }: { postId: number; address: string; onSuccess: () => void; onFailed: (error: string) => void }) {
		if (!this.api) return;

		const tx = this.api.tx.referenda.placeDecisionDeposit(postId);
		await this.executeTx({
			tx,
			address,
			errorMessageFallback: 'Failed to submit decision deposit',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true
		});
	}

	async getTreasurySpendsData() {
		if (!this.api) return null;

		const currentBlockHeight = await this.getBlockHeight();

		const proposals = await this.api?.query?.treasury?.spends?.entries();

		const treasuryPendingSpends: IPayout[] = [];

		proposals?.forEach((proposal) => {
			const indexData = proposal?.[0]?.toHuman();
			const spendData = proposal?.[1]?.toHuman();

			if (indexData && spendData) {
				const expiresAt = Number(((spendData as any)?.expireAt as string)?.split(',')?.join(''));
				const startsAt = Number(((spendData as any)?.validFrom as string)?.split(',')?.join(''));

				if (new BN(currentBlockHeight).gt(new BN(startsAt)) && new BN(currentBlockHeight).lt(new BN(expiresAt)) && (spendData as any).status === 'Pending') {
					const payout: IPayout = {
						treasurySpendIndex: Number(((indexData as any)?.[0] as string)?.split(',')?.join('')),
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

	async claimTreasuryPayout({ payouts, address, onSuccess, onFailed }: { payouts: IPayout[]; address: string; onSuccess: () => void; onFailed: (error: string) => void }) {
		if (!this.api || !payouts || payouts.length === 0) return;

		const tx = payouts.map((p) => this.api.tx.treasury.payout(p.treasurySpendIndex));

		const batchTx = tx.length > 1 ? this.api.tx.utility.batch(tx) : tx[0];

		await this.executeTx({
			tx: batchTx,
			address,
			errorMessageFallback: 'Failed to claim treasury payout',
			onSuccess,
			onFailed,
			waitTillFinalizedHash: true
		});
	}
}
