// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EJudgementStatus, IJudgementStats, IJudgementRequest, IGenericListingResponse } from '@shared/types';

interface IRegistrarInfo {
	address: string;
	latestJudgementDate?: Date;
	totalReceivedRequests: number;
	totalJudgementsGiven: number;
	registrarFee: string;
	registrarIndex: number;
}
enum EJudgementStatusType {
	REASONABLE = 'Reasonable',
	KNOWN_GOOD = 'KnownGood',
	OUT_OF_DATE = 'OutOfDate',
	LOW_QUALITY = 'LowQuality',
	ERRONEOUS = 'Erroneous'
}

interface IdentityField {
	Raw?: string;
}

interface IdentityData {
	twitter?: IdentityField;
	email?: IdentityField;
	discord?: IdentityField;
	matrix?: IdentityField;
	riot?: IdentityField;
	github?: IdentityField;
	web?: IdentityField;
	[key: string]: IdentityField | undefined;
}

export function mapJudgementStatus(judgementData: string): EJudgementStatus {
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

export function getJudgementStats(allJudgements: IJudgementRequest[]): IJudgementStats {
	try {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();
		const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

		const currentMonthRequests = allJudgements.filter((judgement) => {
			const judgementDate = new Date(judgement.dateInitiated);
			return judgementDate.getMonth() === currentMonth && judgementDate.getFullYear() === currentYear;
		});

		const previousMonthRequests = allJudgements.filter((judgement) => {
			const judgementDate = new Date(judgement.dateInitiated);
			return judgementDate.getMonth() === previousMonth && judgementDate.getFullYear() === previousYear;
		});

		const totalRequestedThisMonth = currentMonthRequests.length;
		const totalRequestedLastMonth = previousMonthRequests.length;

		const percentageIncreaseFromLastMonth =
			totalRequestedLastMonth === 0 ? (totalRequestedThisMonth === 0 ? 0 : 100) : ((totalRequestedThisMonth - totalRequestedLastMonth) / totalRequestedLastMonth) * 100;
		const completedThisMonth = currentMonthRequests.filter((judgement) => judgement.status === EJudgementStatus.APPROVED || judgement.status === EJudgementStatus.REJECTED).length;

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

export function getJudgementRequests({
	allJudgements,
	page,
	limit,
	search
}: {
	allJudgements: IJudgementRequest[];
	page: number;
	limit: number;
	search?: string;
}): IGenericListingResponse<IJudgementRequest> {
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

export function getRegistrarsWithStats({
	registrars,
	judgements,
	search
}: {
	registrars: { account: string; fee: number; fields: number }[];
	judgements: IJudgementRequest[];
	search?: string;
}): IRegistrarInfo[] {
	try {
		let filteredRegistrars = registrars;
		if (search && search.trim().length > 0) {
			const searchLower = search.trim().toLowerCase();
			filteredRegistrars = registrars.filter(
				(registrar, index) => (registrar.account && registrar.account.toLowerCase().includes(searchLower)) || index.toString() === searchLower
			);
		}

		return filteredRegistrars.map((registrar) => {
			const index = registrars.indexOf(registrar);
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

export function countSocialsFromIdentity(identity: IdentityData): number {
	let count = 0;
	if (identity.twitter?.Raw) count += 1;
	if (identity.email?.Raw) count += 1;
	if (identity.discord?.Raw) count += 1;
	if (identity.matrix?.Raw || identity.riot?.Raw) count += 1;
	if (identity.github?.Raw) count += 1;
	if (identity.web?.Raw) count += 1;
	return count;
}

export function getSocialsFromIdentity(identity: IdentityData) {
	return {
		twitter: identity.twitter?.Raw || '',
		email: identity.email?.Raw || '',
		discord: identity.discord?.Raw || '',
		matrix: identity.matrix?.Raw || identity.riot?.Raw || '',
		github: identity.github?.Raw || '',
		web: identity.web?.Raw || ''
	};
}

export interface IIdentityUpdate {
	type: 'IdentitySet' | 'JudgementRequested' | 'JudgementGiven' | 'IdentityCleared' | 'SubIdentityAdded' | 'SubIdentityRemoved';
	timestamp: string;
	blockNumber: number;
	blockHash: string;
	extrinsicHash: string;
	extrinsicIndex: number;
	signer: string;
	success: boolean;
	changes?: Array<{ field: string; oldValue?: string; newValue?: string }>;
	registrarIndex?: number;
	registrarAddress?: string;
	judgement?: string;
	maxFee?: string;
	events: Array<{ section: string; method: string; data: unknown }>;
}

export interface IIdentityFieldValue {
	Raw?: string;
	BlakeTwo256?: string;
	Sha256?: string;
	Keccak256?: string;
	ShaThree256?: string;
	None?: null;
}

export interface IIdentityInfo {
	display?: IIdentityFieldValue;
	legal?: IIdentityFieldValue;
	web?: IIdentityFieldValue;
	matrix?: IIdentityFieldValue;
	email?: IIdentityFieldValue;
	twitter?: IIdentityFieldValue;
	discord?: IIdentityFieldValue;
	github?: IIdentityFieldValue;
	image?: IIdentityFieldValue;
	pgpFingerprint?: string | null;
	additional?: Array<[IIdentityFieldValue, IIdentityFieldValue]>;
}

export function formatIdentityUpdateType(type: IIdentityUpdate['type']): string {
	const typeMap: Record<string, string> = {
		IdentitySet: 'Identity Set',
		JudgementRequested: 'Judgement Requested',
		JudgementGiven: 'Judgement Given',
		IdentityCleared: 'Identity Cleared',
		SubIdentityAdded: 'Sub-Identity Added',
		SubIdentityRemoved: 'Sub-Identity Removed'
	};
	return typeMap[type] || type;
}

export function formatDate(date: Date): string {
	const day = date.getDate();
	const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const year = date.getFullYear().toString().slice(-2);
	const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
	return `${day}${suffix} ${month}'${year}, ${time}`;
}

export function formatJudgementLabel(judgement: string): string {
	switch (judgement) {
		case 'KnownGood':
			return 'Known Good';
		case 'OutOfDate':
			return 'Out of Date';
		case 'LowQuality':
			return 'Low Quality';
		default:
			return judgement;
	}
}

export function getJudgementBadge(status: string): string {
	switch (status) {
		case 'APPROVED':
			return 'Reasonable';
		case 'REJECTED':
			return 'Erroneous';
		case 'REQUESTED':
			return 'Requested';
		default:
			return 'Pending';
	}
}

function extractFieldValue(field: IIdentityFieldValue | undefined): string {
	if (!field) return '';

	const fieldAny = field as Record<string, unknown>;

	if (fieldAny.none !== undefined) return '';

	if (fieldAny.raw || fieldAny.Raw) {
		const hexValue = (fieldAny.raw || fieldAny.Raw) as string;
		if (hexValue.startsWith('0x')) {
			try {
				const hex = hexValue.slice(2);
				const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
				return new TextDecoder().decode(bytes);
			} catch {
				return hexValue;
			}
		}
		return hexValue;
	}

	if (fieldAny.blakeTwo256 || fieldAny.BlakeTwo256) return `Blake2-256: ${fieldAny.blakeTwo256 || fieldAny.BlakeTwo256}`;
	if (fieldAny.sha256 || fieldAny.Sha256) return `SHA-256: ${fieldAny.sha256 || fieldAny.Sha256}`;
	if (fieldAny.keccak256 || fieldAny.Keccak256) return `Keccak-256: ${fieldAny.keccak256 || fieldAny.Keccak256}`;
	if (fieldAny.shaThree256 || fieldAny.ShaThree256) return `SHA3-256: ${fieldAny.shaThree256 || fieldAny.ShaThree256}`;

	return '';
}

function parseIdentityInfo(info: IIdentityInfo): Record<string, string> {
	return {
		display: extractFieldValue(info.display),
		legal: extractFieldValue(info.legal),
		web: extractFieldValue(info.web),
		matrix: extractFieldValue(info.matrix),
		email: extractFieldValue(info.email),
		twitter: extractFieldValue(info.twitter),
		discord: extractFieldValue(info.discord),
		github: extractFieldValue(info.github),
		image: extractFieldValue(info.image),
		pgpFingerprint: info.pgpFingerprint || ''
	};
}

export async function parseBlockExtrinsicsForIdentityUpdates(
	blockData: {
		height: number;
		hash: string;
		timestamp: string;
		extrinsics: Array<{
			id: string;
			index: number;
			hash: string;
			section: string;
			method: string;
			args: unknown;
			signer: string;
			success: boolean;
			events: Array<{ id: string; index: number; section: string; method: string; data: unknown }>;
		}>;
	},
	targetAddress?: string
): Promise<IIdentityUpdate[]> {
	const identityExtrinsics = blockData.extrinsics.filter((extrinsic) => {
		return extrinsic.section === 'identity' && (!targetAddress || extrinsic.signer === targetAddress);
	});

	return identityExtrinsics.flatMap((extrinsic): IIdentityUpdate[] => {
		const baseUpdate = {
			timestamp: blockData.timestamp,
			blockNumber: blockData.height,
			blockHash: blockData.hash,
			extrinsicHash: extrinsic.hash,
			extrinsicIndex: extrinsic.index,
			signer: extrinsic.signer,
			success: extrinsic.success,
			events: extrinsic.events.map((e) => ({ section: e.section, method: e.method, data: e.data }))
		};

		try {
			const args = extrinsic.args as Record<string, unknown>;

			switch (extrinsic.method) {
				case 'setIdentity': {
					const info = args.info as IIdentityInfo;
					const parsedInfo = parseIdentityInfo(info);

					return [
						{
							...baseUpdate,
							type: 'IdentitySet' as const,
							changes: Object.entries(parsedInfo)
								.filter(([, value]) => value)
								.map(([field, value]) => ({
									field,
									newValue: value
								}))
						}
					];
				}

				case 'requestJudgement': {
					const regIndex = (args.regIndex || args.reg_index) as number;
					const maxFee = args.maxFee || args.max_fee;

					return [
						{
							...baseUpdate,
							type: 'JudgementRequested' as const,
							registrarIndex: regIndex,
							maxFee: maxFee ? String(maxFee) : undefined
						}
					];
				}

				case 'provideJudgement': {
					return [
						{
							...baseUpdate,
							type: 'JudgementGiven' as const,
							registrarIndex: args.reg_index as number,
							judgement: args.judgement ? JSON.stringify(args.judgement) : undefined
						}
					];
				}

				case 'clearIdentity': {
					return [
						{
							...baseUpdate,
							type: 'IdentityCleared' as const
						}
					];
				}

				case 'setSubs': {
					const subs = args.subs as Array<[string, unknown]>;
					if (subs && subs.length > 0) {
						return [
							{
								...baseUpdate,
								type: 'SubIdentityAdded' as const,
								changes: subs.map(([address]) => ({
									field: 'sub-identity',
									newValue: address
								}))
							}
						];
					}
					return [];
				}

				default:
					return [];
			}
		} catch {
			return [];
		}
	});
}

export interface IIdentityHistoryBlock {
	blockNumber: number;
	blockHash: string;
	timestamp: string;
	updateType: IIdentityUpdate['type'];
	extrinsicHash: string;
	data?: Record<string, unknown>;
}

function mapStatescanEventToUpdateType(eventName: string): IIdentityHistoryBlock['updateType'] | null {
	const eventMap: Record<string, IIdentityHistoryBlock['updateType']> = {
		IdentitySet: 'IdentitySet',
		JudgementRequested: 'JudgementRequested',
		JudgementGiven: 'JudgementGiven',
		IdentityCleared: 'IdentityCleared',
		SubIdentityAdded: 'SubIdentityAdded',
		SubIdentityRemoved: 'SubIdentityRemoved'
	};
	return eventMap[eventName] || null;
}

export function formatIdentityHistoryBlocks(blocks: IIdentityHistoryBlock[]): IIdentityUpdate[] {
	return blocks.map((block) => {
		const eventData = (block.data || {}) as Record<string, unknown>;

		const registrarData = eventData.registrar as Record<string, unknown> | undefined;
		const registrarIndex = registrarData?.index as number | undefined;
		const registrarAddress = registrarData?.account as string | undefined;

		const judgement = eventData.judgement || eventData.Judgement;
		const maxFee = eventData.max_fee || eventData.maxFee || eventData.fee;

		const changes: Array<{ field: string; newValue?: string }> = [];

		if (block.updateType === 'IdentitySet') {
			const identityFields = ['display', 'email', 'twitter', 'web', 'legal', 'matrix', 'discord', 'github', 'riot'];
			identityFields.forEach((field) => {
				const value = eventData[field];
				if (value && typeof value === 'string') {
					changes.push({
						field: field.charAt(0).toUpperCase() + field.slice(1),
						newValue: value
					});
				}
			});
		}

		return {
			type: block.updateType,
			timestamp: block.timestamp,
			blockNumber: block.blockNumber,
			blockHash: block.blockHash,
			extrinsicHash: block.extrinsicHash || '',
			extrinsicIndex: 0,
			signer: '',
			success: true,
			events: [],
			registrarIndex: registrarIndex !== undefined ? Number(registrarIndex) : undefined,
			registrarAddress: registrarAddress || undefined,
			judgement: judgement ? String(judgement) : undefined,
			maxFee: maxFee ? String(maxFee) : undefined,
			changes: changes.length > 0 ? changes : undefined
		};
	});
}

export interface IStatescanTimelineItem {
	name: string;
	args: Record<string, unknown>;
	indexer: {
		chain: string | null;
		blockHeight: number;
		blockHash: string;
		blockTime: number;
		extrinsicIndex: number;
		eventIndex: number;
	};
}

export interface IStatescanResponse {
	data: {
		identityTimeline: IStatescanTimelineItem[];
	};
}

export async function fetchIdentityTimelineFromStatescan(network: string, address: string): Promise<IIdentityHistoryBlock[]> {
	const statescanEndpoints: Record<string, string> = {
		polkadot: 'https://dot-gh-api.statescan.io/graphql',
		kusama: 'https://ksm-gh-api.statescan.io/graphql'
	};

	const endpoint = statescanEndpoints[network];
	if (!endpoint) {
		throw new Error(`Statescan API not available for network: ${network}`);
	}

	const query = `
		query GetIdentityTimeline($account: String!) {
			identityTimeline(account: $account) {
				name
				args
				indexer {
					chain
					blockHeight
					blockHash
					blockTime
					extrinsicIndex
					eventIndex
				}
			}
		}
	`;

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query,
			variables: { account: address },
			operationName: 'GetIdentityTimeline'
		})
	});

	if (!response.ok) {
		throw new Error(`Statescan API error: ${response.statusText}`);
	}

	const data: IStatescanResponse = await response.json();

	if (!data.data?.identityTimeline) {
		return [];
	}

	const history: IIdentityHistoryBlock[] = data.data.identityTimeline
		.map((item): IIdentityHistoryBlock | null => {
			const updateType = mapStatescanEventToUpdateType(item.name);
			if (!updateType) return null;

			return {
				blockNumber: item.indexer.blockHeight,
				blockHash: item.indexer.blockHash,
				timestamp: new Date(item.indexer.blockTime).toISOString(),
				updateType,
				extrinsicHash: '',
				data: item.args
			};
		})
		.filter((item): item is IIdentityHistoryBlock => item !== null);

	return history;
}
