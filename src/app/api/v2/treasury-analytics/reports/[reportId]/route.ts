// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ITreasuryReport } from '@/_shared/types';

interface IRouteParams {
	params: Promise<{
		reportId: string;
	}>;
}

/**
 * GET /api/v2/analytics/reports/[reportId]
 *
 * Returns a specific treasury report by ID.
 * The report includes all sections as defined in the PRD:
 * - Cover Page
 * - Executive Summary (AI-generated narrative)
 * - Treasury Flow Statement
 * - Income Statement
 * - Balance Sheet
 * - Segment Reporting
 * - Category Breakdown
 * - Top Recipients
 * - Liquidity & Risk Section
 * - Methodology & Footnotes
 * - Annexes
 */
export const GET = withErrorHandling(async (_req: NextRequest, { params }: IRouteParams): Promise<NextResponse<ITreasuryReport | { error: string }>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	const { reportId } = await params;

	if (!reportId) {
		return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
	}

	// TODO: Implement actual data fetching from OffChainDbService
	// For now, return empty/placeholder data structure

	const response: ITreasuryReport = {
		id: reportId,
		period: '',
		periodType: 'monthly',
		generatedAt: new Date().toISOString(),
		coverPage: {
			period: '',
			periodType: 'monthly',
			generatedAt: new Date().toISOString(),
			summaryMetrics: {
				treasuryBalance: '0',
				treasuryBalanceUsd: '0',
				spendForPeriod: '0',
				spendForPeriodUsd: '0',
				netChange: '0',
				netChangeUsd: '0',
				percentageChange: 0
			}
		},
		executiveSummary: {
			narrative: '',
			keyInsights: [],
			inflowDrivers: [],
			outflowDrivers: [],
			categoryShifts: [],
			newLiabilities: [],
			liquidityNotes: [],
			governanceImplications: [],
			aiConfidence: 0
		},
		flowStatement: {
			openingBalance: '0',
			openingBalanceUsd: '0',
			totalInflows: '0',
			totalInflowsUsd: '0',
			inflowBreakdown: [],
			totalOutflows: '0',
			totalOutflowsUsd: '0',
			outflowBreakdown: [],
			netResult: '0',
			netResultUsd: '0',
			closingBalance: '0',
			closingBalanceUsd: '0',
			monthOnMonthChange: 0
		},
		incomeStatement: {
			inflationRevenue: '0',
			feesRevenue: '0',
			slashes: '0',
			transfers: '0',
			operatingResult: '0',
			burnImpact: '0',
			changeVsPriorPeriod: 0
		},
		balanceSheet: {
			assets: [],
			liabilities: [],
			netTreasuryPosition: '0',
			netTreasuryPositionUsd: '0',
			dotValuation: '0',
			usdValuation: '0'
		},
		segmentReporting: [],
		categoryBreakdown: [],
		topRecipients: [],
		liquidityRisk: {
			liquidityRatio: 0,
			stablecoinBuffer: '0',
			stablecoinBufferUsd: '0',
			volatilityExposure: 0,
			concentrationMetrics: {
				categoryConcentration: 0,
				recipientConcentration: 0
			}
		},
		methodologyFootnotes: {
			indexDelays: [],
			missingData: [],
			currencyConversions: '',
			tokenPriceSnapshot: []
		},
		annexes: {
			definitions: [],
			dataSources: [],
			references: []
		}
	};

	return NextResponse.json(response);
});
