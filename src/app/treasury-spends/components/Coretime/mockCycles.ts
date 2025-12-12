// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export type CoretimeCycle = {
	id: string;
	core: number;
	startPeriod: string;
	endPeriod: string;
	regionBegin: string;
	regionEnd: string;
	cycleDuration: string;
	assetId: string | null;
	totalRevenue: string;
	currentPrice: string;
	floorPrice: string;
	revenue: string;
	renewal: string;
	purchase: string;
	availableCores: number;
	totalCores: number;
	sold: number;
	currentPhase: string;
	endsIn: string;
	totalPeriod: string;
	fullPeriod: string;
	startsAt: string;
	endsAt: string;
	progressPercent: number;
};

export const coretimeCyclesMock: CoretimeCycle[] = [
	{
		id: '1',
		core: 23,
		startPeriod: '2025-01-01',
		endPeriod: '2025-06-30',
		regionBegin: '353,000',
		regionEnd: '357,000',
		cycleDuration: '5,000',
		assetId: null,
		totalRevenue: '1165260000000000',
		currentPrice: '~ 1.34k DOT',
		floorPrice: '10 DOT',
		revenue: '~ 950 DOT',
		renewal: '~ 500 DOT',
		purchase: '~ 450 DOT',
		availableCores: 49,
		totalCores: 65,
		sold: 16,
		currentPhase: 'Interlude',
		endsIn: '2d 15hrs',
		totalPeriod: '22d 20hrs',
		fullPeriod: '/27d 5hrs',
		startsAt: '2025-09-19',
		endsAt: '2025-10-16',
		progressPercent: 70
	},
	{
		id: '2',
		core: 24,
		startPeriod: '2025-02-01',
		endPeriod: '2025-07-31',
		regionBegin: '360,000',
		regionEnd: '364,000',
		cycleDuration: '4,000',
		assetId: null,
		totalRevenue: '985260000000000',
		currentPrice: '~ 980 DOT',
		floorPrice: '9 DOT',
		revenue: '~ 820 DOT',
		renewal: '~ 410 DOT',
		purchase: '~ 410 DOT',
		availableCores: 55,
		totalCores: 70,
		sold: 15,
		currentPhase: 'Sale',
		endsIn: '5d 4hrs',
		totalPeriod: '15d 11hrs',
		fullPeriod: '/30d 2hrs',
		startsAt: '2025-10-01',
		endsAt: '2025-10-31',
		progressPercent: 52
	}
];
