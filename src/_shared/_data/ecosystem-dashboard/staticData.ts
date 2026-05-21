// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sonarjs/no-duplicate-string */

import { IEcosystemDashboardData } from './types';

const ASOF = '2026-02-01';

const STATIC_ECOSYSTEM_DASHBOARD_DATA: IEcosystemDashboardData = {
	mode: 'static',
	generatedAt: new Date().toISOString(),
	asOfDate: ASOF,
	hero: {
		title: 'Polkadot Ecosystem Observatory',
		standfirst: 'Live network metrics and quarterly snapshot of treasury, governance, and ecosystem activity on Polkadot.',
		stats: [
			{ label: 'Network market cap', value: '$6.2B', sub: 'Peak $53B · Nov 2021' },
			{ label: 'Ecosystem TVL', value: '$143M', sub: 'Across Polkadot parachains' },
			{ label: 'Treasury balance', value: '$58M', sub: '32M DOT on relay chain' },
			{ label: 'Active validators', value: '400', sub: '29.5K nominators · 13.08% APY' },
			{ label: 'Active parachains', value: '65+', sub: 'Coretime model since 2024' }
		]
	},
	economy: {
		priceUsd: 4.15,
		priceDisplay: '$4.15',
		marketCapUsd: 6_220_000_000,
		marketCapDisplay: '$6.22B',
		athPriceUsd: 55.13,
		athPriceDate: '2021-11-04',
		peakMarketCapUsd: 53_000_000_000,
		peakMarketCapDate: '2021-11-04',
		circulatingSupplyDot: 1_660_000_000,
		stakedDot: 843_900_000,
		stakedRatioPercent: 50.8,
		activeValidators: 400,
		activeNominators: 29_457,
		stakingApyPercent: 13.08,
		nakamotoCoefficient: 149,
		weeklyCoreDevs: 122,
		priceTimeline: [
			{ period: '2020-09', value: 3_500_000_000, label: 'Sep 2020' },
			{ period: '2021-05', value: 41_000_000_000, label: 'May 2021' },
			{ period: '2021-11', value: 53_000_000_000, label: 'Nov 2021', annotation: 'Peak market cap $53B' },
			{ period: '2022-06', value: 8_400_000_000, label: 'Jun 2022' },
			{ period: '2023-01', value: 6_500_000_000, label: 'Jan 2023' },
			{ period: '2023-12', value: 9_800_000_000, label: 'Dec 2023' },
			{ period: '2024-03', value: 14_200_000_000, label: 'Mar 2024' },
			{ period: '2024-09', value: 5_900_000_000, label: 'Sep 2024' },
			{ period: '2025-04', value: 5_200_000_000, label: 'Apr 2025' },
			{ period: '2025-12', value: 6_220_000_000, label: 'Dec 2025' }
		]
	},
	treasury: {
		currentDot: 32_000_000,
		currentUsd: 57_800_000,
		peakUsd: 2_400_000_000,
		peakUsdDate: '2022-01',
		cumulativeDeployedUsd: 240_000_000,
		balanceTimeline: [
			// Pre-peak buildup: treasury accumulated from 80% of staking inflation since mainnet launch
			{ period: '2020-08', value: 0, label: 'Aug 2020' },
			{ period: '2021-06', value: 200_000_000, label: 'Jun 2021' },
			{ period: '2021-11', value: 1_100_000_000, label: 'Nov 2021' },
			{ period: '2022-01', value: 2_400_000_000, label: 'Jan 2022', annotation: 'Peak treasury · 76M DOT × spot price' },
			{ period: '2022-06', value: 540_000_000, label: 'Jun 2022' },
			{ period: '2023-06', value: 245_000_000, label: 'Jun 2023' },
			{ period: '2024-06', value: 245_000_000, label: 'Jun 2024' },
			{ period: '2024-12', value: 130_000_000, label: 'Dec 2024' },
			{ period: '2025-06', value: 78_000_000, label: 'Jun 2025' },
			{ period: '2025-12', value: 57_800_000, label: 'Dec 2025' }
		],
		annualSpend: [
			{ year: '2022', usd: 12_000_000 },
			{ year: '2023', usd: 33_500_000 },
			{ year: '2024', usd: 133_000_000 },
			{ year: '2025', usd: 68_000_000 }
		],
		categoryBreakdown: [
			{
				year: '2024',
				categories: [
					{ name: 'Outreach', usd: 48_000_000, sharePercent: 36 },
					{ name: 'Software development', usd: 32_000_000, sharePercent: 24 },
					{ name: 'Business development', usd: 19_000_000, sharePercent: 14 },
					{ name: 'Economy incentives', usd: 15_000_000, sharePercent: 11 },
					{ name: 'Talent & education', usd: 9_900_000, sharePercent: 7 },
					{ name: 'Network infrastructure', usd: 6_500_000, sharePercent: 5 },
					{ name: 'Research', usd: 2_500_000, sharePercent: 2 }
				]
			},
			{
				year: '2025',
				categories: [
					{ name: 'Software development', usd: 17_500_000, sharePercent: 34 },
					{ name: 'Outreach', usd: 11_700_000, sharePercent: 23 },
					{ name: 'Operations', usd: 9_200_000, sharePercent: 18 },
					{ name: 'Business development', usd: 8_200_000, sharePercent: 16 },
					{ name: 'Economy incentives', usd: 2_400_000, sharePercent: 5 },
					{ name: 'Research', usd: 1_100_000, sharePercent: 2 },
					{ name: 'Talent & education', usd: 900_000, sharePercent: 2 }
				]
			}
		]
	},
	openGov: {
		totalReferenda: 1971,
		openGovReferenda: 1888,
		govV1Proposals: 83,
		originTracks: 15,
		rejectionRatePercent: 40,
		approvalRatePercent: 60,
		medianTurnoutPercent: 7.4,
		referendaPerQuarter: [
			{ period: '2023-Q3', value: 87, label: 'Q3 2023' },
			{ period: '2023-Q4', value: 188, label: 'Q4 2023' },
			{ period: '2024-Q1', value: 210, label: 'Q1 2024' },
			{ period: '2024-Q2', value: 245, label: 'Q2 2024' },
			{ period: '2024-Q3', value: 218, label: 'Q3 2024' },
			{ period: '2024-Q4', value: 196, label: 'Q4 2024' },
			{ period: '2025-Q1', value: 184, label: 'Q1 2025' },
			{ period: '2025-Q2', value: 162, label: 'Q2 2025' },
			{ period: '2025-Q3', value: 128, label: 'Q3 2025' },
			{ period: '2025-Q4', value: 98, label: 'Q4 2025' }
		]
	},
	governanceInterfaces: {
		overview:
			'OpenGov proposals are authored, discussed, and voted through two web interfaces. Comments are mirrored bidirectionally via shared APIs; each interface maintains its own user base and network coverage. A small remainder of proposals is submitted directly via the relay-chain RPC.',
		discussionShare: [
			{ name: 'Polkassembly', sharePercent: 95.66 },
			{ name: 'Subsquare', sharePercent: 4.04 },
			{ name: 'Direct RPC / others', sharePercent: 0.3 }
		],
		interfaces: [
			{
				name: 'Polkassembly',
				role: 'End-to-end governance workflow — discovery, discussion, delegation, voting, and identity.',
				homeUrl: 'https://polkadot.polkassembly.io',
				stats: [
					{ label: 'Discussion share', value: '95.66%', sub: 'of OpenGov post volume' },
					{ label: 'Comment share', value: '82.66%', sub: 'across both interfaces' },
					{ label: 'Networks served', value: '50+', sub: 'Substrate chains and testnets' },
					{ label: 'Monthly active users', value: '250K+', sub: 'across all served networks' },
					{ label: 'API requests', value: '92M+', sub: 'per month' },
					{ label: 'Treasury value surfaced', value: '$300M+', sub: 'cumulative referenda decisions' }
				],
				notable: [
					'Primary discussion surface for Polkadot OpenGov since 2021.',
					'Operates the App Hub for Polkadot, Kusama, and 50+ Substrate chains.',
					'Identity verification and judgement workflow integrated with on-chain registrar.'
				],
				revenue: {
					totalUsd: 3_692_835,
					periodLabel: '2021 — 2025',
					scopeLabel: 'Polka Labs (Polkassembly + PolkaSafe combined)',
					proposals: [
						{
							idx: 53,
							type: 'treasury',
							title: 'Polkassembly Social Contract',
							date: '2021-06-17',
							usd: 41566,
							payment: '1,849 DOT @ $22.48',
							url: 'https://polkadot.polkassembly.io/treasury/53'
						},
						{
							idx: 83,
							type: 'treasury',
							title: 'Polkassembly Social Contract',
							date: '2022-01-11',
							usd: 40412,
							payment: '1,582 DOT @ $25.55',
							url: 'https://polkadot.polkassembly.io/treasury/83'
						},
						{
							idx: 99,
							type: 'treasury',
							title: 'Polkassembly Product Improvement Proposal',
							date: '2022-03-15',
							usd: 83529,
							payment: '4,690 DOT @ $17.81',
							url: 'https://polkadot.polkassembly.io/treasury/99'
						},
						{
							idx: 188,
							type: 'treasury',
							title: 'Polkassembly Social Contract',
							date: '2022-11-16',
							usd: 79082,
							payment: '13,857 DOT @ $5.71',
							url: 'https://polkadot.polkassembly.io/treasury/188'
						},
						{
							idx: 220,
							type: 'treasury',
							title: 'PolkaSafe — user-friendly multisig for Polkadot & Kusama',
							date: '2023-02-01',
							usd: 444424,
							payment: '68,807 DOT @ $6.46',
							url: 'https://polkadot.polkassembly.io/treasury/220'
						},
						{
							idx: 240,
							type: 'treasury',
							title: 'Polkassembly Social Contract — Q1 2023',
							date: '2023-02-27',
							usd: 92821,
							payment: '14,111 DOT @ $6.58',
							url: 'https://polkadot.polkassembly.io/treasury/240'
						},
						{
							idx: 475,
							type: 'treasury',
							title: 'Polkassembly Social Contract — Q3/Q4 2023',
							date: '2023-11-01',
							usd: 204162,
							payment: '43,154 DOT @ $4.73',
							url: 'https://polkadot.polkassembly.io/treasury/475'
						},
						{
							idx: 499,
							type: 'treasury',
							title: 'PolkaSafe — retroactive funding',
							date: '2023-11-21',
							usd: 161085,
							payment: '33,125 DOT @ $4.86',
							url: 'https://polkadot.polkassembly.io/treasury/499'
						},
						{
							idx: 696,
							type: 'treasury',
							title: 'Polkassembly Social Contract 2024',
							date: '2024-03-08',
							usd: 1834233,
							payment: '172,067 DOT @ $10.66',
							url: 'https://polkadot.polkassembly.io/treasury/696'
						},
						{
							idx: 933,
							type: 'referendum',
							title: 'PolkaSafe — 360° multisig solution (final retroactive)',
							date: '2024-07-24',
							usd: 180850,
							payment: '180,850 USDT',
							url: 'https://polkadot.polkassembly.io/referenda/933'
						},
						{
							idx: 1463,
							type: 'referendum',
							title: 'Polkassembly Social Contract 2025',
							date: '2025-03-28',
							usd: 530671,
							payment: '530,671 USDT',
							url: 'https://polkadot.polkassembly.io/referenda/1463'
						}
					]
				}
			},
			{
				name: 'Subsquare',
				role: 'OpenGov dashboards, notifications, and an alternative discussion thread.',
				homeUrl: 'https://polkadot.subsquare.io',
				stats: [
					{ label: 'Discussion share', value: '4.04%', sub: 'of OpenGov post volume' },
					{ label: 'Comment share', value: '17.34%', sub: 'across both interfaces' },
					{ label: 'Networks served', value: '8+', sub: 'Polkadot, Kusama, selected chains' },
					{ label: 'Monthly active users', value: '50K+', sub: 'across all served networks' },
					{ label: 'API requests', value: '20M+', sub: 'per month' },
					{ label: 'Treasury value surfaced', value: '$55M+', sub: 'cumulative referenda decisions' }
				],
				notable: [
					'Comments authored on either platform are mirrored to the other via shared APIs.',
					'Maintains independent dashboards for treasury, fellowship, and referenda.',
					'Open-source codebase under an MIT licence.'
				],
				revenue: {
					totalUsd: 2_255_914,
					periodLabel: '2021 — 2026',
					scopeLabel: 'OpenSquare (operator of Subsquare)',
					proposals: [
						{
							idx: 42,
							type: 'treasury',
							title: 'doTreasury Polkadot integration',
							date: '2021-03-28',
							usd: 12122,
							payment: '376 DOT @ $32.24',
							url: 'https://polkadot.polkassembly.io/treasury/42'
						},
						{
							idx: 155,
							type: 'treasury',
							title: 'OpenSquare — delivered features + new development',
							date: '2022-08-03',
							usd: 150889,
							payment: '18,854 DOT @ $8.00',
							url: 'https://polkadot.polkassembly.io/treasury/155'
						},
						{
							idx: 206,
							type: 'treasury',
							title: 'Subsquare/doTreasury — new features & development',
							date: '2023-01-11',
							usd: 173668,
							payment: '33,860 DOT @ $5.13',
							url: 'https://polkadot.polkassembly.io/treasury/206'
						},
						{
							idx: 336,
							type: 'treasury',
							title: 'Subsquare/doTreasury — new features (incl. gov stats)',
							date: '2023-07-13',
							usd: 205030,
							payment: '36,969 DOT @ $5.55',
							url: 'https://polkadot.polkassembly.io/treasury/336'
						},
						{
							idx: 464,
							type: 'treasury',
							title: 'OpenSquare infrastructure maintenance — 2023 Q2/Q3',
							date: '2023-10-25',
							usd: 289444,
							payment: '67,438 DOT @ $4.29',
							url: 'https://polkadot.polkassembly.io/treasury/464'
						},
						{
							idx: 759,
							type: 'treasury',
							title: 'Subsquare Polkadot fellowship support — milestone 1',
							date: '2024-04-23',
							usd: 118392,
							payment: '16,348 DOT @ $7.24',
							url: 'https://polkadot.polkassembly.io/treasury/759'
						},
						{
							idx: 1001,
							type: 'referendum',
							title: 'Subsquare Polkadot collectives support — milestone 2',
							date: '2024-08-08',
							usd: 176400,
							payment: '176,400 USDT',
							url: 'https://polkadot.polkassembly.io/referenda/1001'
						},
						{
							idx: 1225,
							type: 'referendum',
							title: 'Subsquare 12-month maintenance + features (retroactive)',
							date: '2024-11-11',
							usd: 469845,
							payment: '469,845 USDT',
							url: 'https://polkadot.polkassembly.io/referenda/1225'
						},
						{
							idx: 1612,
							type: 'referendum',
							title: 'Subsquare — new features + maintenance',
							date: '2025-07-07',
							usd: 444124,
							payment: '444,124 USDC',
							url: 'https://polkadot.polkassembly.io/referenda/1612'
						},
						{
							idx: 1860,
							type: 'referendum',
							title: 'OpenSquare products — maintenance & development 2026',
							date: '2026-04-08',
							usd: 216000,
							payment: '12 × 18,000 USDT',
							url: 'https://polkadot.polkassembly.io/referenda/1860'
						}
					]
				}
			}
		],
		commentSyncNote: 'Discussion share = the platform on which each OpenGov proposal hosts its primary thread. Comment bodies are mirrored bidirectionally across both interfaces.'
	},
	multisig: {
		overview:
			'Multisig accounts on Polkadot are native to Substrate — any account holder can construct one without an external smart contract. Several user-facing platforms wrap this primitive with a UI, transaction queue, and notifications. AUM is the on-chain DOT and stable balances managed through each platform.',
		totalPeakAumUsd: 480_000_000,
		totalCurrentAumUsd: 122_000_000,
		platforms: [
			{
				name: 'PolkaSafe',
				role: 'Multisig wallet platform with treasury management, address book, and proposal queue.',
				homeUrl: 'https://polkasafe.xyz',
				peakAumUsd: 300_000_000,
				currentAumUsd: 63_400_000,
				peakSharePercent: 62,
				currentSharePercent: 52
			},
			{
				name: 'Multix',
				role: 'Multisig manager built by ChainSafe; supports pure proxies and nested multisigs.',
				homeUrl: 'https://multix.chainsafe.io',
				peakAumUsd: 120_000_000,
				currentAumUsd: 34_200_000,
				peakSharePercent: 25,
				currentSharePercent: 28
			},
			{
				name: 'Signet',
				role: 'Talisman multisig with portfolio view and transaction signing flow.',
				homeUrl: 'https://signet.talisman.xyz',
				peakAumUsd: 38_000_000,
				currentAumUsd: 14_600_000,
				peakSharePercent: 8,
				currentSharePercent: 12
			},
			{
				name: 'Native pallet (no UI)',
				role: 'Multisigs constructed directly via the Substrate multisig pallet without a managing platform.',
				homeUrl: 'https://wiki.polkadot.network/docs/learn-account-multisig',
				peakAumUsd: 22_000_000,
				currentAumUsd: 9_800_000,
				peakSharePercent: 5,
				currentSharePercent: 8
			}
		]
	},
	infrastructure: {
		activeParachains: 65,
		monthlyActiveDevs: 475,
		q1TransactionsMillions: 137.1,
		blockTimeSeconds: 6,
		finalitySeconds: 12,
		coretimeNote:
			'In 2024 Polkadot transitioned from fixed-slot parachain auctions to Agile Coretime — a market for blockspace measured in 28-day bulk cores and on-demand spot purchases.',
		topParachains: [
			{ name: 'Frequency', transactionsMillions: 26.8, sharePercent: 19.5 },
			{ name: 'Moonbeam', transactionsMillions: 16.7, sharePercent: 12.2 },
			{ name: 'Phala', transactionsMillions: 15.1, sharePercent: 11.0 },
			{ name: 'Mythos', transactionsMillions: 12.3, sharePercent: 9.0 },
			{ name: 'peaq', transactionsMillions: 10.1, sharePercent: 7.4 }
		]
	},
	defi: {
		totalEcosystemTvlUsd: 143_000_000,
		asOfDate: '2026-01-15',
		stablecoinSupplyUsd: undefined,
		topProtocols: [
			{ name: 'Hydration', chain: 'Hydration', tvlUsd: 70_900_000, category: 'DEX / money market' },
			{ name: 'Hydration Lending', chain: 'Hydration', tvlUsd: 37_700_000, category: 'Money market' },
			{ name: 'Bifrost Liquid Staking', chain: 'Bifrost', tvlUsd: 24_300_000, category: 'Liquid staking' },
			{ name: 'Moonwell', chain: 'Moonbeam', tvlUsd: 13_500_000, category: 'Money market' },
			{ name: 'Acala', chain: 'Acala', tvlUsd: 9_400_000, category: 'DEX / stablecoin' },
			{ name: 'StellaSwap', chain: 'Moonbeam', tvlUsd: 7_200_000, category: 'DEX' },
			{ name: 'Astar', chain: 'Astar', tvlUsd: 5_300_000, category: 'Smart-contract platform' }
		]
	},
	xcm: {
		totalMessagesAllTime: 4_820_000,
		monthlyMessagesAvg: 312_000,
		connectedChains: 47,
		openChannels: 230
	}
};

export { STATIC_ECOSYSTEM_DASHBOARD_DATA };
