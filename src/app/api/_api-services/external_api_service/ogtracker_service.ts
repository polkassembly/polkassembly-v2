// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IOGTrackerData, IOGTrackerPoW, IOGTrackerProposal, IOGTrackerTask } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OG_TRACKER_API_KEY } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';

const API_BASE_URL = 'https://api.ogtracker.io/rest/v1';

export class OGTrackerService {
	static async getOGTrackerData({ refNum }: { refNum: string }): Promise<IOGTrackerData> {
		try {
			if (!OG_TRACKER_API_KEY) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'OGTracker API key not configured');
			}

			const getHeaders = () => ({
				apikey: OG_TRACKER_API_KEY || '',
				Authorization: `Bearer ${OG_TRACKER_API_KEY}`,
				'Content-Type': 'application/json'
			});

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			try {
				const proposalRes = await fetch(`${API_BASE_URL}/proposals?refnum=eq.${refNum}&select=*`, {
					headers: getHeaders(),
					signal: controller.signal
				});

				if (!proposalRes.ok) {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, proposalRes.status, 'Failed to fetch proposal from OGTracker');
				}

				const proposals: IOGTrackerProposal[] = await proposalRes.json();

				if (!proposals || proposals.length === 0) {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.NOT_FOUND, `No proposal found on OGTracker for RefNum: ${refNum}`);
				}

				const proposal = proposals[0];
				const proposalId = proposal.id;

				const [tasksRes, powRes] = await Promise.all([
					fetch(`${API_BASE_URL}/tasks?proposal_id=eq.${proposalId}&select=*`, { headers: getHeaders(), signal: controller.signal }),
					fetch(`${API_BASE_URL}/proposals_report?proposal_id=eq.${proposalId}&select=*`, { headers: getHeaders(), signal: controller.signal })
				]);

				const tasks: IOGTrackerTask[] = tasksRes.ok ? await tasksRes.json() : [];
				const proofOfWork: IOGTrackerPoW[] = powRes.ok ? await powRes.json() : [];

				return {
					proposal,
					tasks,
					proofOfWork
				};
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.REQUEST_TIMEOUT, 'Request to OGTracker timed out');
				}
				throw err;
			} finally {
				clearTimeout(timeoutId);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error('Error fetching OGTracker data:', error);
			if (error instanceof APIError) {
				throw error;
			}
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Error fetching OGTracker data: ${message}`);
		}
	}
}
