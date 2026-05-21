// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-restricted-syntax, no-continue, security/detect-object-injection, sonarjs/cognitive-complexity, prefer-destructuring */

import { STATIC_ECOSYSTEM_DASHBOARD_DATA } from '@/_shared/_data/ecosystem-dashboard/staticData';
import { IEcosystemDashboardData, Mode } from '@/_shared/_data/ecosystem-dashboard/types';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=polkadot&price_change_percentage=24h';

// ---------------------------------------------------------------------------
// DefiLlama: map from slug → our display name
// Only include protocols where /tvl/{slug} returns a Polkadot-ecosystem figure.
// Moonwell is excluded: it is multi-chain (Moonbeam + Base + Optimism) and
// /tvl/moonwell-lending returns the all-chain total, not the Polkadot/Moonbeam
// slice only — which would overstate ecosystem TVL.
// ---------------------------------------------------------------------------
const DEFILLAMA_SLUG_TO_NAME: Record<string, string> = {
	'hydration-dex': 'Hydration',
	'hydration-lending': 'Hydration Lending',
	'bifrost-liquid-staking': 'Bifrost Liquid Staking',
	acala: 'Acala',
	'stellaswap-v4': 'StellaSwap',
	'stellaswap-v3': 'StellaSwap', // sum with v4
	'astar-dapps-staking': 'Astar'
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Matches the client-side fmtUsd in index.tsx exactly
const fmtUsd = (n: number): string => {
	if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}M`;
	if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
	return `$${n.toFixed(2)}`;
};

const fetchWithTimeout = async (url: string, timeoutMs = 6000): Promise<Response> => {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal });
		clearTimeout(id);
		return res;
	} catch (e) {
		clearTimeout(id);
		throw e;
	}
};

// ---------------------------------------------------------------------------
// Live data fetchers
// ---------------------------------------------------------------------------

interface LiveDotMarket {
	price: number;
	marketCap: number;
	ath: number;
	athDate: string; // YYYY-MM-DD
	circulatingSupply: number;
}

const fetchLiveDotMarket = async (): Promise<LiveDotMarket | null> => {
	try {
		const res = await fetchWithTimeout(COINGECKO_URL);
		if (!res.ok) return null;
		const data = await res.json();
		const row = Array.isArray(data) ? data[0] : null;
		if (!row?.current_price || !row?.market_cap) return null;
		return {
			price: Number(row.current_price),
			marketCap: Number(row.market_cap),
			ath: row.ath ? Number(row.ath) : 0,
			athDate: row.ath_date ? String(row.ath_date).split('T')[0] : '',
			circulatingSupply: row.circulating_supply ? Number(row.circulating_supply) : 0
		};
	} catch {
		return null;
	}
};

interface DefiLlamaTvlResult {
	// Map from our display name → live TVL (only protocols we successfully fetched)
	protocolTvls: Record<string, number>;
}

const fetchDefiLlamaTvl = async (): Promise<DefiLlamaTvlResult | null> => {
	try {
		const entries = Object.entries(DEFILLAMA_SLUG_TO_NAME);

		// Fetch all protocol TVLs in parallel; /tvl/{slug} returns a plain number
		const results = await Promise.allSettled(
			entries.map(async ([slug, displayName]) => {
				const res = await fetchWithTimeout(`https://api.llama.fi/tvl/${slug}`, 7000);
				if (!res.ok) throw new Error(`${slug} HTTP ${res.status}`);
				const raw = await res.json();
				const tvl = typeof raw === 'number' ? raw : 0;
				return { displayName, tvl };
			})
		);

		const protocolTvls: Record<string, number> = {};
		for (const result of results) {
			if (result.status !== 'fulfilled') continue;
			const { displayName, tvl } = result.value;
			// Store result even if tvl=0 so we don't fall back to stale static values
			protocolTvls[displayName] = (protocolTvls[displayName] ?? 0) + tvl;
		}

		if (Object.keys(protocolTvls).length === 0) return null;
		return { protocolTvls };
	} catch {
		return null;
	}
};

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export const buildEcosystemDashboardData = async (mode: Mode = 'live'): Promise<IEcosystemDashboardData> => {
	const base: IEcosystemDashboardData = JSON.parse(JSON.stringify(STATIC_ECOSYSTEM_DASHBOARD_DATA));
	base.mode = mode;
	base.generatedAt = new Date().toISOString();

	if (mode === 'live') {
		// Run CoinGecko and DefiLlama fetches in parallel
		const [live, tvl] = await Promise.all([fetchLiveDotMarket(), fetchDefiLlamaTvl()]);

		if (live) {
			// --- Spot price & market cap ---
			base.economy.priceUsd = live.price;
			base.economy.priceDisplay = `$${live.price.toFixed(2)}`;
			base.economy.marketCapUsd = live.marketCap;
			base.economy.marketCapDisplay = fmtUsd(live.marketCap);
			base.hero.stats[0] = {
				label: 'Network market cap',
				value: fmtUsd(live.marketCap),
				sub: 'Peak $53B · Nov 2021'
			};
			// Update the trailing market-cap timeline point to the live value
			const lastPrice = base.economy.priceTimeline[base.economy.priceTimeline.length - 1];
			if (lastPrice) lastPrice.value = live.marketCap;

			// --- All-time high ---
			if (live.ath) base.economy.athPriceUsd = live.ath;
			if (live.athDate) base.economy.athPriceDate = live.athDate;

			// --- Circulating supply ---
			if (live.circulatingSupply) base.economy.circulatingSupplyDot = Math.round(live.circulatingSupply);

			// --- Treasury USD = on-chain DOT holdings × live spot price ---
			const treasuryUsd = Math.round(base.treasury.currentDot * live.price);
			base.treasury.currentUsd = treasuryUsd;
			const treasuryStatIdx = base.hero.stats.findIndex((s) => s.label === 'Treasury balance');
			if (treasuryStatIdx >= 0) {
				base.hero.stats[treasuryStatIdx] = {
					...base.hero.stats[treasuryStatIdx],
					value: fmtUsd(treasuryUsd)
				};
			}
			// Update the trailing treasury timeline point to the live value
			const lastTreasury = base.treasury.balanceTimeline[base.treasury.balanceTimeline.length - 1];
			if (lastTreasury) lastTreasury.value = treasuryUsd;
		}

		if (tvl) {
			base.defi.asOfDate = new Date().toISOString().split('T')[0];

			// Patch individual protocol TVLs; fall back to static for protocols not fetched
			base.defi.topProtocols = base.defi.topProtocols
				.map((p) =>
					// Only overwrite if we received a result (even 0 is a valid live value)
					p.name in tvl.protocolTvls ? { ...p, tvlUsd: Math.round(tvl.protocolTvls[p.name]) } : p
				)
				// Re-sort by TVL descending so display order matches current rankings
				.sort((a, b) => b.tvlUsd - a.tvlUsd);

			// Recompute ecosystem total as sum of all displayed protocol TVLs
			// (combines freshly-fetched values with static fallbacks for any we missed)
			const totalTvl = base.defi.topProtocols.reduce((sum, p) => sum + p.tvlUsd, 0);
			base.defi.totalEcosystemTvlUsd = totalTvl;

			// Update hero ecosystem TVL stat
			const tvlStatIdx = base.hero.stats.findIndex((s) => s.label === 'Ecosystem TVL');
			if (tvlStatIdx >= 0) {
				base.hero.stats[tvlStatIdx] = {
					...base.hero.stats[tvlStatIdx],
					value: fmtUsd(totalTvl)
				};
			}
		}
	}

	return base;
};
