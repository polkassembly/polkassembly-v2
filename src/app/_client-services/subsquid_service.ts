// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EJudgementStatus, ENetwork, IJudgementRequest, IJudgementStats, IRegistrarInfo } from '@shared/types';

interface SubsquidResponse<T> {
	data: T;
}

interface SubsquidIdentity {
	id: string;
	account: {
		id: string;
	};
	info: {
		display?: {
			Raw?: string;
		};
		email?: {
			Raw?: string;
		};
		twitter?: {
			Raw?: string;
		};
	};
	judgements: Array<{
		registrarIndex: number;
		judgement: string;
		blockNumber: number;
		timestamp: string;
	}>;
}

interface SubsquidRegistrar {
	id: string;
	account: {
		id: string;
	};
	fee: string;
	fields: Array<{
		field: string;
		value: string;
	}>;
}

export class SubsquidService {
	private readonly network: ENetwork;

	private readonly endpoint: string;

	constructor(network: ENetwork) {
		this.network = network;
		this.endpoint = this.getSubsquidEndpoint();
	}

	private getSubsquidEndpoint(): string {
		// Map networks to their Subsquid endpoints
		const endpoints: Record<ENetwork, string> = {
			[ENetwork.POLKADOT]: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
			[ENetwork.KUSAMA]: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
			[ENetwork.WESTEND]: 'https://squid.subsquid.io/westend-polkassembly/graphql',
			[ENetwork.PASEO]: 'https://squid.subsquid.io/paseo-polkassembly/graphql'
		};

		return endpoints[this.network] || endpoints[ENetwork.POLKADOT];
	}

	private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
		try {
			const response = await fetch(this.endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query,
					variables
				})
			});

			if (!response.ok) {
				throw new Error(`Subsquid query failed: ${response.statusText}`);
			}

			const result: SubsquidResponse<T> = await response.json();
			return result.data;
		} catch (error) {
			console.error('Subsquid query error:', error);
			throw error;
		}
	}

	private static mapJudgementStatus(judgement: string): EJudgementStatus {
		switch (judgement) {
			case 'Reasonable':
			case 'KnownGood':
				return EJudgementStatus.APPROVED;
			case 'OutOfDate':
			case 'LowQuality':
			case 'Erroneous':
				return EJudgementStatus.REJECTED;
			default:
				return EJudgementStatus.PENDING;
		}
	}

	async getIdentityJudgements(): Promise<IJudgementRequest[]> {
		const query = `
			query GetIdentityJudgements($limit: Int!, $offset: Int!) {
				identities(limit: $limit, offset: $offset, where: { judgements_some: {} }) {
					id
					account {
						id
					}
					info {
						display {
							Raw
						}
						email {
							Raw
						}
						twitter {
							Raw
						}
					}
					judgements {
						registrarIndex
						judgement
						blockNumber
						timestamp
					}
				}
			}
		`;

		try {
			const result = await this.query<{ identities: SubsquidIdentity[] }>(query, {
				limit: 1000,
				offset: 0
			});

			const judgements: IJudgementRequest[] = [];

			result.identities.forEach((identity) => {
				identity.judgements.forEach((judgement) => {
					const judgementRequest: IJudgementRequest = {
						id: `${identity.account.id}-${judgement.registrarIndex}-${judgement.blockNumber}`,
						address: identity.account.id,
						displayName: identity.info.display?.Raw || '',
						email: identity.info.email?.Raw || '',
						twitter: identity.info.twitter?.Raw || '',
						status: SubsquidService.mapJudgementStatus(judgement.judgement),
						dateInitiated: new Date(judgement.timestamp),
						registrarIndex: judgement.registrarIndex,
						registrarAddress: '', // Will be filled by registrar lookup
						judgementHash: `${judgement.blockNumber}`
					};

					judgements.push(judgementRequest);
				});
			});

			return judgements.sort((a, b) => b.dateInitiated.getTime() - a.dateInitiated.getTime());
		} catch (error) {
			console.error('Error fetching judgements from Subsquid:', error);
			return [];
		}
	}

	async getRegistrars(): Promise<IRegistrarInfo[]> {
		const query = `
			query GetRegistrars {
				registrars {
					id
					account {
						id
					}
					fee
					fields {
						field
						value
					}
				}
			}
		`;

		try {
			const result = await this.query<{ registrars: SubsquidRegistrar[] }>(query);

			return result.registrars.map((registrar, index) => ({
				address: registrar.account.id,
				registrarFee: registrar.fee,
				registrarIndex: index,
				totalReceivedRequests: 0, // TODO: Calculate from judgements
				totalJudgementsGiven: 0, // TODO: Calculate from judgements
				latestJudgementDate: undefined // TODO: Calculate from judgements
			}));
		} catch (error) {
			console.error('Error fetching registrars from Subsquid:', error);
			return [];
		}
	}

	async getJudgementStats(): Promise<IJudgementStats> {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();

		try {
			const judgements = await this.getIdentityJudgements();

			const currentMonthRequests = judgements.filter((judgement) => {
				const judgementDate = new Date(judgement.dateInitiated);
				return judgementDate.getMonth() === currentMonth && judgementDate.getFullYear() === currentYear;
			});

			const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
			const previousMonthRequests = judgements.filter((judgement) => {
				const judgementDate = new Date(judgement.dateInitiated);
				return judgementDate.getMonth() === previousMonth && judgementDate.getFullYear() === previousYear;
			});

			const totalRequestedThisMonth = currentMonthRequests.length;
			const totalRequestedLastMonth = previousMonthRequests.length;
			const percentageIncreaseFromLastMonth = totalRequestedLastMonth === 0 ? 100 : ((totalRequestedThisMonth - totalRequestedLastMonth) / totalRequestedLastMonth) * 100;

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
			console.error('Error calculating judgement stats from Subsquid:', error);
			return {
				totalRequestedThisMonth: 0,
				percentageIncreaseFromLastMonth: 0,
				percentageCompletedThisMonth: 0
			};
		}
	}
}
