// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { IReportArchive, ITreasuryReport } from '@/_shared/types';
import { z } from 'zod';

const zodQuerySchema = z.object({
	type: z.enum(['monthly', 'annual']).optional(),
	year: z.coerce.number().optional(),
	month: z.coerce.number().min(1).max(12).optional(),
	limit: z.coerce.number().max(100).optional().default(12),
	page: z.coerce.number().optional().default(1)
});

/**
 * GET /api/v2/treasury-analytics/reports
 *
 * Returns the report archive with list of available treasury reports.
 * Supports filtering by type (monthly/annual) and year.
 *
 * Query Parameters:
 * - type: 'monthly' | 'annual' (optional)
 * - year: number (optional)
 * - limit: number (default: 12)
 * - page: number (default: 1)
 *
 * Each report in the archive includes download URLs for PDF, CSV, and XLS formats.
 */
export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<IReportArchive>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// Parse and validate query parameters
	zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	// TODO: Implement actual data fetching from OffChainDbService
	// For now, return empty/placeholder data structure

	const response: IReportArchive = {
		reports: [],
		totalReports: 0
	};

	return NextResponse.json(response);
});

/**
 * POST /api/v2/treasury-analytics/reports
 *
 * Triggers generation of a new treasury report.
 * This is typically called by a scheduled job or admin action.
 *
 * Request Body:
 * - periodType: 'monthly' | 'annual'
 * - year: number
 * - month: number (required for monthly reports)
 */
export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse<ITreasuryReport>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	const body = await req.json();
	const { periodType, year, month } = body;

	// Validate request
	if (!periodType || !year) {
		return NextResponse.json({ error: 'periodType and year are required' } as unknown as ITreasuryReport, { status: 400 });
	}

	if (periodType === 'monthly' && !month) {
		return NextResponse.json({ error: 'month is required for monthly reports' } as unknown as ITreasuryReport, { status: 400 });
	}

	// TODO: Implement actual report generation
	// This should aggregate all analytics data and generate the report
	// For now, return empty/placeholder data structure

	const period = periodType === 'monthly' ? `${year}-${String(month).padStart(2, '0')}` : `${year}`;

	const response: ITreasuryReport = {
		id: '',
		period,
		periodType,
		generatedAt: new Date().toISOString(),
		coverPage: {
			period,
			periodType,
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
