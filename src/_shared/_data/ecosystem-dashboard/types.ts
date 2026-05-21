// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export type Mode = 'live' | 'static';

export interface IHeroStat {
	label: string;
	value: string;
	sub?: string;
}

export interface ITimePoint {
	period: string;
	value: number;
	label?: string;
	annotation?: string;
}

export interface IEconomySection {
	priceUsd: number;
	priceDisplay: string;
	marketCapUsd: number;
	marketCapDisplay: string;
	athPriceUsd: number;
	athPriceDate: string;
	peakMarketCapUsd: number;
	peakMarketCapDate: string;
	circulatingSupplyDot: number;
	stakedDot: number;
	stakedRatioPercent: number;
	activeValidators: number;
	activeNominators: number;
	stakingApyPercent: number;
	nakamotoCoefficient: number;
	weeklyCoreDevs: number;
	priceTimeline: ITimePoint[];
}

export interface IDefiSection {
	totalEcosystemTvlUsd: number;
	asOfDate: string;
	stablecoinSupplyUsd?: number;
	topProtocols: { name: string; chain: string; tvlUsd: number; category: string }[];
}

export interface IXcmSection {
	totalMessagesAllTime: number;
	monthlyMessagesAvg: number;
	connectedChains: number;
	openChannels: number;
}

export interface ITreasurySection {
	currentDot: number;
	currentUsd: number;
	peakUsd: number;
	peakUsdDate: string;
	cumulativeDeployedUsd: number;
	balanceTimeline: ITimePoint[];
	annualSpend: { year: string; usd: number }[];
	categoryBreakdown: { year: string; categories: { name: string; usd: number; sharePercent: number }[] }[];
}

export interface IOpenGovSection {
	totalReferenda: number;
	openGovReferenda: number;
	govV1Proposals: number;
	originTracks: number;
	rejectionRatePercent: number;
	approvalRatePercent: number;
	medianTurnoutPercent: number;
	referendaPerQuarter: ITimePoint[];
}

export interface ITreasuryRevenueProposal {
	idx: number; // on-chain proposal/referendum index
	type: 'treasury' | 'referendum';
	title: string;
	date: string; // YYYY-MM-DD
	usd: number; // USD value at spot price on date (or direct stablecoin value)
	payment: string; // human display: "172,067 DOT" or "530,671 USDT"
	url: string; // Polkassembly proposal link
}

export interface ITreasuryRevenue {
	totalUsd: number;
	periodLabel: string; // e.g., "2021 — 2026"
	scopeLabel: string; // e.g., "Polka Labs (Polkassembly + PolkaSafe)"
	proposals: ITreasuryRevenueProposal[];
}

export interface IGovernanceInterface {
	name: string;
	role: string;
	stats: { label: string; value: string; sub?: string }[];
	notable: string[];
	homeUrl: string;
	revenue?: ITreasuryRevenue;
}

export interface IGovernanceInterfacesSection {
	overview: string;
	discussionShare: { name: string; sharePercent: number }[];
	interfaces: IGovernanceInterface[];
	commentSyncNote: string;
}

export interface IMultisigPlatform {
	name: string;
	role: string;
	peakAumUsd: number;
	currentAumUsd: number;
	peakSharePercent: number;
	currentSharePercent: number;
	homeUrl: string;
}

export interface IMultisigSection {
	overview: string;
	totalPeakAumUsd: number;
	totalCurrentAumUsd: number;
	platforms: IMultisigPlatform[];
}

export interface INetworkInfraSection {
	activeParachains: number;
	monthlyActiveDevs: number;
	q1TransactionsMillions: number;
	blockTimeSeconds: number;
	finalitySeconds: number;
	coretimeNote: string;
	topParachains: { name: string; transactionsMillions: number; sharePercent: number }[];
}

export interface IEcosystemDashboardData {
	mode: Mode;
	generatedAt: string;
	asOfDate: string;
	hero: {
		title: string;
		standfirst: string;
		stats: IHeroStat[];
	};
	economy: IEconomySection;
	treasury: ITreasurySection;
	openGov: IOpenGovSection;
	governanceInterfaces: IGovernanceInterfacesSection;
	multisig: IMultisigSection;
	infrastructure: INetworkInfraSection;
	defi: IDefiSection;
	xcm: IXcmSection;
}
