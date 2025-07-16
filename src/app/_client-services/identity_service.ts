// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-await-in-loop */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ClientError } from '@app/_client-utils/clientError';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Signer, SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, BN_ZERO, hexToString, isHex } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

import { ENetwork, IOnChainIdentity, IJudgementStats, EJudgementStatus, EJudgementStatusType, IJudgementRequest, IJudgementListingResponse, IRegistrarInfo } from '@shared/types';

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
			provider: new WsProvider(NETWORKS_DETAILS[network as ENetwork].peopleChainDetails.rpcEndpoints[0].url)
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
			this.currentPeopleChainRpcEndpointIndex = (this.currentPeopleChainRpcEndpointIndex + 1) % NETWORKS_DETAILS[this.network].peopleChainDetails.rpcEndpoints.length;
		}

		this.peopleChainApi.disconnect();
		this.peopleChainApi = await ApiPromise.create({
			provider: new WsProvider(NETWORKS_DETAILS[this.network].peopleChainDetails.rpcEndpoints[this.currentPeopleChainRpcEndpointIndex].url)
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
				provider: new WsProvider(NETWORKS_DETAILS[this.network].peopleChainDetails.rpcEndpoints[this.currentPeopleChainRpcEndpointIndex].url)
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
					return NETWORKS_DETAILS[this.network].peopleChainDetails.polkassemblyRegistrarIndex === Number(index) && ['KnownGood', 'Reasonable'].includes(judgement);
				})
			: false;
	}

	setSigner(signer: Signer) {
		this.peopleChainApi.setSigner(signer);
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
		if (!this.peopleChainApi || !tx) return;

		const extrinsic = proxyAddress ? this.peopleChainApi.tx.proxy.proxy(address, null, tx) : tx;

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
							const dispatchError = (event.data as any)?.dispatchError;
							isFailed = true;

							if (dispatchError?.isModule) {
								const errorModule = (event.data as any)?.dispatchError?.asModule;
								const { method, section, docs } = this.peopleChainApi.registry.findMetaError(errorModule);
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
				console.log(error?.toString?.(), 'error?.toString?.()', errorMessageFallback);
				onFailed(error?.toString?.() || errorMessageFallback);
				console.error('ERROR:', error);
			});
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	async getOnChainIdentity(address: string): Promise<IOnChainIdentity> {
		const encodedQueryAddress = getEncodedAddress(address, this.network) || address;
		const parentProxyInfo = await this.getParentProxyInfo({ address: encodedQueryAddress });
		const encodedAddress = parentProxyInfo?.address ? getEncodedAddress(parentProxyInfo.address, this.network) : encodedQueryAddress;

		const identityInfoRes: any = await this.peopleChainApi?.query.identity?.identityOf(encodedAddress);

		const identityInfo = await (identityInfoRes?.toHuman()?.[0] || identityInfoRes?.toHuman?.());
		const identityHashInfo = await (identityInfoRes?.unwrapOr?.(null)?.[0] || identityInfoRes?.unwrapOr?.(null));

		const { isGood, unverified } = IdentityService.processIdentityInfo(identityInfo);

		const verifiedByPolkassembly = this.checkVerifiedByPolkassembly(identityInfo);

		const identity = identityInfo?.info;
		const identityHash = identityHashInfo?.info?.hash?.toHex();

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
			web: identity?.web?.Raw || '',
			...(identityHash && { hash: identityHash })
		};
	}

	getSetIdentityTx({ displayName, email, legalName, twitter, matrix }: { displayName: string; email: string; legalName?: string; twitter?: string; matrix?: string }) {
		return this.peopleChainApi?.tx.identity.setIdentity({
			display: { [displayName ? 'raw' : 'none']: displayName || null },
			legal: { [legalName ? 'raw' : 'none']: legalName || null },
			email: { [email ? 'raw' : 'none']: email || null },
			twitter: { [twitter ? 'raw' : 'none']: twitter || null },
			matrix: { [matrix ? 'raw' : 'none']: matrix || null }
		});
	}

	async setOnChainIdentity({
		address,
		displayName,
		email,
		legalName,
		twitter,
		matrix,
		registrarFee,
		onSuccess,
		onFailed
	}: {
		address: string;
		displayName: string;
		email: string;
		legalName?: string;
		twitter?: string;
		matrix?: string;
		registrarFee: BN;
		onSuccess?: () => void;
		onFailed?: (errorMessageFallback?: string) => void;
	}) {
		const encodedAddress = getEncodedAddress(address, this.network) || address;
		const setIdentityTx = this.getSetIdentityTx({
			displayName,
			email,
			legalName,
			twitter,
			matrix
		});

		const { polkassemblyRegistrarIndex } = NETWORKS_DETAILS[`${this.network}`].peopleChainDetails;

		const requestedJudgementTx = this.peopleChainApi.tx?.identity?.requestJudgement(polkassemblyRegistrarIndex, registrarFee.toString());

		const tx = registrarFee && !registrarFee.isZero() ? this.peopleChainApi.tx.utility.batchAll([setIdentityTx, requestedJudgementTx]) : setIdentityTx;

		await this.executeTx({
			tx,
			address: encodedAddress,
			errorMessageFallback: 'Failed to set identity',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: (errorMessageFallback: string) => {
				console.log(errorMessageFallback, 'errorMessageFallback');
				onFailed?.(errorMessageFallback);
			}
		});
	}

	async getRegistrars() {
		const res = await this.peopleChainApi?.query?.identity?.registrars?.();
		return res.toJSON() as unknown as { account: string; fee: number; fields: number }[];
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

		if (!address || !this.peopleChainApi?.derive?.balances?.all) {
			return responseObj;
		}

		const encodedAddress = getEncodedAddress(address, this.network) || address;
		await this.peopleChainApi.derive.balances
			.all(encodedAddress)
			.then((result) => {
				lockedBalance = new BN(result.lockedBalance || lockedBalance);
			})
			.catch(() => {
				// TODO: show notification
			});

		await this.peopleChainApi.query.system
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

	async getGasFee({
		address,
		registrarFee,
		displayName,
		email,
		legalName,
		twitter,
		matrix
	}: {
		address: string;
		registrarFee: BN;
		displayName: string;
		email: string;
		legalName?: string;
		twitter?: string;
		matrix?: string;
	}) {
		const encodedAddress = getEncodedAddress(address, this.network) || address;
		const setIdentityTx = this.getSetIdentityTx({
			displayName,
			email,
			legalName,
			twitter,
			matrix
		});

		const { polkassemblyRegistrarIndex } = NETWORKS_DETAILS[`${this.network}`].peopleChainDetails;

		const requestedJudgementTx = this.peopleChainApi.tx?.identity?.requestJudgement(polkassemblyRegistrarIndex, registrarFee.toString());

		const tx = registrarFee && !registrarFee.isZero() ? this.peopleChainApi.tx.utility.batchAll([setIdentityTx, requestedJudgementTx]) : setIdentityTx;

		const paymentInfo = await tx?.paymentInfo(encodedAddress);

		return paymentInfo?.partialFee;
	}

	async getJudgementStats(): Promise<IJudgementStats> {
		try {
			const currentDate = new Date();
			const currentMonth = currentDate.getMonth();
			const currentYear = currentDate.getFullYear();

			// Get all identity judgements for current month
			const currentMonthJudgements = await this.getAllIdentityJudgements();
			const currentMonthRequests = currentMonthJudgements.filter((judgement) => {
				const judgementDate = new Date(judgement.dateInitiated);
				return judgementDate.getMonth() === currentMonth && judgementDate.getFullYear() === currentYear;
			});

			// Get all identity judgements for previous month
			const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
			const previousMonthJudgements = await this.getAllIdentityJudgements();
			const previousMonthRequests = previousMonthJudgements.filter((judgement) => {
				const judgementDate = new Date(judgement.dateInitiated);
				return judgementDate.getMonth() === previousMonth && judgementDate.getFullYear() === previousYear;
			});

			const totalRequestedThisMonth = currentMonthRequests.length;
			const totalRequestedLastMonth = previousMonthRequests.length;

			// Calculate percentage increase
			const percentageIncreaseFromLastMonth = totalRequestedLastMonth === 0 ? 100 : ((totalRequestedThisMonth - totalRequestedLastMonth) / totalRequestedLastMonth) * 100;

			// Calculate completed judgements this month
			const completedThisMonth = currentMonthRequests.filter(
				(judgement) => judgement.status === EJudgementStatus.APPROVED || judgement.status === EJudgementStatus.REJECTED
			).length;

			const percentageCompletedThisMonth = totalRequestedThisMonth === 0 ? 0 : (completedThisMonth / totalRequestedThisMonth) * 100;

			return {
				totalRequestedThisMonth,
				percentageIncreaseFromLastMonth,
				percentageCompletedThisMonth
			};
		} catch (error) {
			console.error('Error calculating judgement stats:', error);
			return {
				totalRequestedThisMonth: 0,
				percentageIncreaseFromLastMonth: 0,
				percentageCompletedThisMonth: 0
			};
		}
	}

	private static mapJudgementStatus(judgementData: string): EJudgementStatus {
		switch (judgementData) {
			case EJudgementStatusType.REASONABLE:
			case EJudgementStatusType.KNOWN_GOOD:
				return EJudgementStatus.APPROVED;
			case EJudgementStatusType.OUT_OF_DATE:
			case EJudgementStatusType.LOW_QUALITY:
			case EJudgementStatusType.ERRONEOUS:
				return EJudgementStatus.REJECTED;
			default:
				return EJudgementStatus.PENDING;
		}
	}

	async getAllIdentityJudgements(): Promise<IJudgementRequest[]> {
		console.log('Getting identity judgements for network:', this.network);

		try {
			const registrars = await this.getRegistrars();
			const judgements: IJudgementRequest[] = [];

			const identityEntries = await this.peopleChainApi.query.identity.identityOf.entries();

			identityEntries.forEach(([key, value]) => {
				const address = key.args[0].toString();
				const identityInfo = value.toHuman() as any;

				if (!identityInfo?.judgements || !Array.isArray(identityInfo.judgements)) {
					return;
				}

				const identity = identityInfo.info || {};

				// Process judgements for each registrar
				identityInfo.judgements.forEach((judgement: any) => {
					const [registrarIndex, judgementData] = judgement;
					const registrarIndexNum = Number(registrarIndex);

					if (registrarIndexNum >= 0 && registrarIndexNum < registrars.length) {
						const registrar = registrars[registrarIndexNum];
						const status = IdentityService.mapJudgementStatus(judgementData);

						const displayRaw = identity.display?.Raw ?? identity.display;
						const displayName = isHex(displayRaw) ? hexToString(displayRaw) || displayRaw || '' : displayRaw || '';
						const emailRaw = identity.email?.Raw ?? identity.email;
						const email = isHex(emailRaw) ? hexToString(emailRaw) || emailRaw || '' : emailRaw || '';

						const judgementRequest: IJudgementRequest = {
							id: `${address}-${registrarIndexNum}-${Date.now()}`,
							address,
							displayName,
							email,
							twitter: identity.twitter?.Raw || identity.twitter || '',
							status,
							dateInitiated: new Date(), // We'll improve this with actual block data later
							registrarIndex: registrarIndexNum,
							registrarAddress: registrar.account,
							judgementHash: key.hash.toString()
						};

						judgements.push(judgementRequest);
					}
				});
			});

			return judgements.sort((a, b) => b.dateInitiated.getTime() - a.dateInitiated.getTime());
		} catch (error) {
			console.error('Error fetching identity judgements:', error);
			return [];
		}
	}

	async getJudgementRequests({ page, limit, search }: { page: number; limit: number; search?: string }): Promise<IJudgementListingResponse> {
		const allJudgements = await this.getAllIdentityJudgements();
		let filteredJudgements = allJudgements;
		if (search && search.trim().length > 0) {
			const searchLower = search.trim().toLowerCase();
			filteredJudgements = allJudgements.filter(
				(j) => (j.address && j.address.toLowerCase().includes(searchLower)) || (j.displayName && j.displayName.toLowerCase().includes(searchLower))
			);
		}
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		return {
			items: filteredJudgements.slice(startIndex, endIndex),
			totalCount: filteredJudgements.length
		};
	}

	async getRegistrarsWithStats(): Promise<IRegistrarInfo[]> {
		try {
			const registrars = await this.getRegistrars();
			const judgements = await this.getAllIdentityJudgements();

			return registrars.map((registrar, index) => {
				// Calculate stats for this registrar
				const registrarJudgements = judgements.filter((j) => Number(j?.registrarIndex) === index);
				const totalReceivedRequests = registrarJudgements.length;
				const totalJudgementsGiven = registrarJudgements.filter((j) => j.status === EJudgementStatus.APPROVED || j.status === EJudgementStatus.REJECTED).length;

				const latestJudgement = registrarJudgements.sort((a, b) => b.dateInitiated.getTime() - a.dateInitiated.getTime())[0];

				return {
					address: registrar.account,
					registrarFee: registrar.fee.toString(),
					registrarIndex: index,
					totalReceivedRequests,
					totalJudgementsGiven,
					latestJudgementDate: latestJudgement?.dateInitiated
				};
			});
		} catch (error) {
			console.error('Error fetching registrar stats:', error);
			return [];
		}
	}

	async becomeRegistrar({ address, onSuccess, onFailed }: { address: string; onSuccess?: () => void; onFailed?: (errorMessageFallback?: string) => void }) {
		const encodedAddress = getEncodedAddress(address, this.network) || address;
		const becomeRegistrarTx = this.peopleChainApi.tx.identity.addRegistrar(encodedAddress);

		await this.executeTx({
			tx: becomeRegistrarTx,
			address: encodedAddress,
			errorMessageFallback: 'Failed to become registrar',
			waitTillFinalizedHash: true,
			onSuccess: () => {
				onSuccess?.();
			},
			onFailed: (errorMessageFallback: string) => {
				console.log(errorMessageFallback, 'errorMessageFallback');
				onFailed?.(errorMessageFallback);
			}
		});
	}
}
