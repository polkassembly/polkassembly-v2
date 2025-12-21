// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { BN, BN_ZERO } from '@polkadot/util';
import {
	ITreasuryOverviewStats,
	IAssetDistribution,
	IAssetDistributionByChain,
	IAssetsByLiquidity,
	IStablecoinCoverage,
	ITreasuryHealthIndicators,
	ETreasuryHealthStatus,
	EHttpHeaderKey,
	ITreasuryStats,
	ELiquidityClass
} from '@/_shared/types';

import { fetchLatestTreasuryStats } from '@/app/api/_api-utils/fetchLatestTreasuryStats';

interface ITreasuryOverviewResponse {
	stats: ITreasuryOverviewStats;
	assetDistribution: IAssetDistribution;
	assetDistributionByChain: IAssetDistributionByChain;
	assetsByLiquidity: IAssetsByLiquidity;
	stablecoinCoverage: IStablecoinCoverage;
	healthIndicators: ITreasuryHealthIndicators;
}

/**
 * Transforms raw ITreasuryStats from Firestore into ITreasuryOverviewResponse
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
function transformTreasuryStats(treasuryStats: ITreasuryStats): ITreasuryOverviewResponse {
	const { network } = treasuryStats;
	const tokenDecimals = NETWORKS_DETAILS[network]?.tokenDecimals || 10;
	const tokenSymbol = NETWORKS_DETAILS[network]?.tokenSymbol || 'DOT';

	// Helper to format token amounts (divide by 10^decimals)
	const formatTokenAmount = (amount: string | undefined, decimals = tokenDecimals): string => {
		if (!amount || amount === '') return '0';
		try {
			const bn = new BN(amount);
			const divisor = new BN(10).pow(new BN(decimals));
			return bn.div(divisor).toString();
		} catch {
			return '0';
		}
	};

	// Calculate totals
	const totalNativeToken = treasuryStats.total?.totalNativeToken || '0';
	const totalUsdc = treasuryStats.total?.totalUsdc || '0';
	const totalUsdt = treasuryStats.total?.totalUsdt || '0';
	const totalInUsd = treasuryStats.total?.totalInUsd || '0';

	// Calculate composition from different sources
	const relayChainAmount = treasuryStats.relayChain?.nativeToken || '0';
	const assetHubAmount = treasuryStats.assetHub?.nativeToken || '0';
	const hydrationAmount = treasuryStats.hydration?.nativeToken || '0';
	const bountiesAmount = treasuryStats.bounties?.nativeToken || '0';
	const fellowshipAmount = treasuryStats.fellowship?.nativeToken || '0';

	// Calculate parachains total (hydration + others)
	const parachainsTotal = new BN(hydrationAmount || '0').toString();

	// Calculate stablecoin share
	const stablecoinTotal = new BN(totalUsdc || '0').add(new BN(totalUsdt || '0'));
	const stablecoinDecimals = 6; // USDC/USDT typically have 6 decimals
	const stablecoinUsd = formatTokenAmount(stablecoinTotal.toString(), stablecoinDecimals);
	const stablecoinPercentage = totalInUsd && totalInUsd !== '0' ? (parseFloat(stablecoinUsd) / parseFloat(totalInUsd)) * 100 : 0;

	// Build asset distribution by token
	const assetDistributionItems = [];

	// Native token (DOT/KSM)
	if (totalNativeToken && totalNativeToken !== '0') {
		assetDistributionItems.push({
			asset: tokenSymbol,
			symbol: tokenSymbol,
			amount: totalNativeToken,
			amountUsd: totalInUsd, // Approximate - native token is majority
			percentage: 100 - stablecoinPercentage,
			color: '#E6007A' // Polkadot pink
		});
	}

	// USDT
	if (totalUsdt && totalUsdt !== '0') {
		const usdtValue = formatTokenAmount(totalUsdt, stablecoinDecimals);
		assetDistributionItems.push({
			asset: 'USDT',
			symbol: 'USDT',
			amount: totalUsdt,
			amountUsd: usdtValue,
			percentage: totalInUsd && totalInUsd !== '0' ? (parseFloat(usdtValue) / parseFloat(totalInUsd)) * 100 : 0,
			color: '#26A17B'
		});
	}

	// USDC
	if (totalUsdc && totalUsdc !== '0') {
		const usdcValue = formatTokenAmount(totalUsdc, stablecoinDecimals);
		assetDistributionItems.push({
			asset: 'USDC',
			symbol: 'USDC',
			amount: totalUsdc,
			amountUsd: usdcValue,
			percentage: totalInUsd && totalInUsd !== '0' ? (parseFloat(usdcValue) / parseFloat(totalInUsd)) * 100 : 0,
			color: '#2775CA'
		});
	}

	// MYTH if available
	const mythAmount = treasuryStats.total?.totalMyth || treasuryStats.assetHub?.myth;
	if (mythAmount && mythAmount !== '0') {
		assetDistributionItems.push({
			asset: 'MYTH',
			symbol: 'MYTH',
			amount: mythAmount,
			amountUsd: '0', // Would need MYTH price
			percentage: 0,
			color: '#8B5CF6'
		});
	}

	// Build asset distribution by chain
	const chainDistributionItems = [];

	if (relayChainAmount && relayChainAmount !== '0') {
		chainDistributionItems.push({
			chain: 'Relay Chain',
			amount: relayChainAmount,
			amountUsd: '0', // Would need calculation
			percentage: 0
		});
	}

	if (assetHubAmount && assetHubAmount !== '0') {
		chainDistributionItems.push({
			chain: 'Asset Hub',
			amount: assetHubAmount,
			amountUsd: '0',
			percentage: 0
		});
	}

	if (hydrationAmount && hydrationAmount !== '0') {
		chainDistributionItems.push({
			chain: 'Hydration',
			amount: hydrationAmount,
			amountUsd: '0',
			percentage: 0
		});
	}

	if (bountiesAmount && bountiesAmount !== '0') {
		chainDistributionItems.push({
			chain: 'Bounties',
			amount: bountiesAmount,
			amountUsd: '0',
			percentage: 0
		});
	}

	if (fellowshipAmount && fellowshipAmount !== '0') {
		chainDistributionItems.push({
			chain: 'Fellowship',
			amount: fellowshipAmount,
			amountUsd: '0',
			percentage: 0
		});
	}

	// Calculate chain percentages
	const totalChainAmount = chainDistributionItems.reduce((acc, item) => acc.add(new BN(item.amount || '0')), BN_ZERO);
	chainDistributionItems.forEach((item) => {
		if (!totalChainAmount.isZero()) {
			// eslint-disable-next-line no-param-reassign
			item.percentage = new BN(item.amount).mul(new BN(100)).div(totalChainAmount).toNumber();
		}
	});

	// Build liquidity classification
	const liquidityItems = [
		{
			liquidityClass: ELiquidityClass.LIQUID,
			amount: relayChainAmount,
			amountUsd: '0',
			percentage: 0,
			details: 'Relay chain treasury - immediately available'
		},
		{
			liquidityClass: ELiquidityClass.DESIGNATED,
			amount: assetHubAmount,
			amountUsd: '0',
			percentage: 0,
			details: 'Asset Hub holdings'
		},
		{
			liquidityClass: ELiquidityClass.EARMARKED,
			amount: bountiesAmount,
			amountUsd: '0',
			percentage: 0,
			details: 'Active bounties - committed funds'
		},
		{
			liquidityClass: ELiquidityClass.DEPLOYED,
			amount: hydrationAmount,
			amountUsd: '0',
			percentage: 0,
			details: 'Hydration DeFi positions'
		}
	].filter((item) => item.amount && item.amount !== '0');

	// Calculate liquidity percentages
	liquidityItems.forEach((item) => {
		if (!totalChainAmount.isZero()) {
			// eslint-disable-next-line no-param-reassign
			item.percentage = new BN(item.amount).mul(new BN(100)).div(totalChainAmount).toNumber();
		}
	});

	// Determine health status based on runway and stablecoin coverage
	let overallHealth = ETreasuryHealthStatus.MODERATE;
	if (stablecoinPercentage >= 20) {
		overallHealth = ETreasuryHealthStatus.EXCELLENT;
	} else if (stablecoinPercentage >= 10) {
		overallHealth = ETreasuryHealthStatus.GOOD;
	} else if (stablecoinPercentage >= 5) {
		overallHealth = ETreasuryHealthStatus.MODERATE;
	} else {
		overallHealth = ETreasuryHealthStatus.LOW;
	}

	// Calculate 24h change
	const priceChange = parseFloat(treasuryStats.nativeTokenUsdPrice24hChange || '0');

	return {
		stats: {
			totalTreasuryBalance: {
				amount: formatTokenAmount(totalNativeToken),
				amountUsd: totalInUsd,
				percentageChange: priceChange,
				composition: {
					relayChain: formatTokenAmount(relayChainAmount),
					assetHub: formatTokenAmount(assetHubAmount),
					parachains: formatTokenAmount(parachainsTotal)
				}
			},
			ytdSpend: {
				amount: '0', // Would need historical data
				amountUsd: '0',
				percentageChange: 0
			},
			treasuryRunway: {
				months: 0, // Would need burn rate calculation
				burnRateDescription: treasuryStats.relayChain?.nextBurn ? `Next burn: ${formatTokenAmount(treasuryStats.relayChain.nextBurn)} ${tokenSymbol}` : ''
			},
			stablecoinShare: {
				percentage: Math.round(stablecoinPercentage * 100) / 100,
				amountUsd: stablecoinUsd
			}
		},
		assetDistribution: {
			items: assetDistributionItems,
			totalValueUsd: totalInUsd
		},
		assetDistributionByChain: {
			items: chainDistributionItems,
			totalValueUsd: totalInUsd
		},
		assetsByLiquidity: {
			items: liquidityItems,
			totalValueUsd: totalInUsd
		},
		stablecoinCoverage: {
			currentCoverage: Math.round(stablecoinPercentage * 100) / 100,
			historicalData: [] // Would need historical stablecoin data
		},
		healthIndicators: {
			overallHealth,
			indicators: [
				{
					name: 'Stablecoin Buffer',
					value: `${Math.round(stablecoinPercentage)}%`,
					status: stablecoinPercentage >= 10 ? ETreasuryHealthStatus.GOOD : ETreasuryHealthStatus.LOW,
					description: 'Percentage of treasury in stablecoins'
				},
				{
					name: 'Token Price 24h',
					value: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
					status: priceChange >= 0 ? ETreasuryHealthStatus.GOOD : ETreasuryHealthStatus.LOW,
					description: 'Native token price change in last 24 hours'
				}
			]
		}
	};
}

// ... (existing imports)

// ... (existing helper functions)

/**
 * GET /api/v2/treasury-analytics/treasury-overview
 * ...
 */
export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<ITreasuryOverviewResponse>> => {
	const network = await getNetworkFromHeaders();
	const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	// Try Redis cache first
	if (!skipCache) {
		const cachedData = await RedisService.GetTreasuryOverview({ network });
		if (cachedData) {
			return NextResponse.json(JSON.parse(cachedData) as ITreasuryOverviewResponse);
		}
	}

	// Fetch latest treasury stats from Firestore
	const treasuryStatsArr = await OffChainDbService.GetTreasuryStats({
		network,
		limit: 1,
		page: 1
	});

	let treasuryStats = treasuryStatsArr?.[0];

	// Check if data is valid (has non-zero balance)
	// If invalid or missing, fallback to live fetch
	const isValidData = treasuryStats && treasuryStats.total?.totalNativeToken && treasuryStats.total.totalNativeToken !== '0';

	if (!isValidData) {
		try {
			// Fallback to live fetch (this takes time but ensures we have data)
			const liveStats = await fetchLatestTreasuryStats(network);
			if (liveStats) {
				treasuryStats = liveStats;

				// Save to Firestore so next request is fast and valid
				// We don't await this to speed up response slightly, or we can await to ensure consistency
				await OffChainDbService.SaveTreasuryStats({ treasuryStats: liveStats });
			}
		} catch (error) {
			console.error('Failed to fetch live treasury stats:', error);
		}
	}

	// If still no data, return empty response
	if (!treasuryStats) {
		const emptyResponse: ITreasuryOverviewResponse = {
			stats: {
				totalTreasuryBalance: {
					amount: '0',
					amountUsd: '0',
					percentageChange: 0,
					composition: { relayChain: '0', assetHub: '0', parachains: '0' }
				},
				ytdSpend: { amount: '0', amountUsd: '0', percentageChange: 0 },
				treasuryRunway: { months: 0, burnRateDescription: '' },
				stablecoinShare: { percentage: 0, amountUsd: '0' }
			},
			assetDistribution: { items: [], totalValueUsd: '0' },
			assetDistributionByChain: { items: [], totalValueUsd: '0' },
			assetsByLiquidity: { items: [], totalValueUsd: '0' },
			stablecoinCoverage: { currentCoverage: 0, historicalData: [] },
			healthIndicators: { overallHealth: ETreasuryHealthStatus.MODERATE, indicators: [] }
		};
		return NextResponse.json(emptyResponse);
	}

	// Transform the data
	const response = transformTreasuryStats(treasuryStats);

	// Cache the result
	await RedisService.SetTreasuryOverview({ network, data: JSON.stringify(response) });

	return NextResponse.json(response);
});
