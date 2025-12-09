// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { StatusCodes } from 'http-status-codes';
import { APIError } from '../../_api-utils/apiError';

const EXTERNAL_JOBS_API_URL = 'https://api.dotjobs.online/api/public/jobs';

export class ExternalJobsService {
	static async getJobs({ page = 1, limit = 10, sortBy = 'createdAt' }: { page?: number; limit?: number; sortBy?: string }) {
		try {
			const url = new URL(EXTERNAL_JOBS_API_URL);
			url.searchParams.append('page', page.toString());
			url.searchParams.append('limit', limit.toString());
			url.searchParams.append('sortBy', sortBy);

			const response = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new APIError('ExternalJobsError', response.status || StatusCodes.INTERNAL_SERVER_ERROR, `External API responded with status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching external jobs:', error);
			throw error;
		}
	}
}
