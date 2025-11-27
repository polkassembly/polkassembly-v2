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
