// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import {
	ITreasuryOverviewStats,
	IAssetDistribution,
	IAssetDistributionByChain,
	IAssetsByLiquidity,
	IStablecoinCoverage,
	ITreasuryHealthIndicators,
	ETreasuryHealthStatus
} from '@/_shared/types';

interface ITreasuryOverviewResponse {
	stats: ITreasuryOverviewStats;
	assetDistribution: IAssetDistribution;
	assetDistributionByChain: IAssetDistributionByChain;
	assetsByLiquidity: IAssetsByLiquidity;
	stablecoinCoverage: IStablecoinCoverage;
	healthIndicators: ITreasuryHealthIndicators;
}

/**
 * GET /api/v2/analytics/treasury-overview
 *
 * Returns treasury overview data including:
 * - Total treasury balance with composition (relay chain, AssetHub, parachains)
 * - YTD spend, runway, stablecoin share
 * - Asset distribution by token (DOT, USDT, USDC, etc.)
 * - Asset distribution by chain (Relay, AssetHub, Hydration, Centrifuge)
 * - Assets by liquidity class (Liquid, Designated, Earmarked, Deployed)
 * - Stablecoin coverage over time
 * - Treasury health indicators (liquidity ratio, burn-to-inflation, volatility exposure)
 */
export const GET = withErrorHandling(async (): Promise<NextResponse<ITreasuryOverviewResponse>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// TODO: Implement actual data fetching from OnChainDbService/RedisService
	// For now, return empty/placeholder data structure

	const response: ITreasuryOverviewResponse = {
		stats: {
			totalTreasuryBalance: {
				amount: '0',
				amountUsd: '0',
				percentageChange: 0,
				composition: {
					relayChain: '0',
					assetHub: '0',
					parachains: '0'
				}
			},
			ytdSpend: {
				amount: '0',
				amountUsd: '0',
				percentageChange: 0
			},
			treasuryRunway: {
				months: 0,
				burnRateDescription: ''
			},
			stablecoinShare: {
				percentage: 0,
				amountUsd: '0'
			}
		},
		assetDistribution: {
			items: [],
			totalValueUsd: '0'
		},
		assetDistributionByChain: {
			items: [],
			totalValueUsd: '0'
		},
		assetsByLiquidity: {
			items: [],
			totalValueUsd: '0'
		},
		stablecoinCoverage: {
			currentCoverage: 0,
			historicalData: []
		},
		healthIndicators: {
			overallHealth: ETreasuryHealthStatus.MODERATE,
			indicators: []
		}
	};

	return NextResponse.json(response);
});
