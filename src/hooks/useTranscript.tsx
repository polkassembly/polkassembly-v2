// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect, useCallback } from 'react';

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptData {
	transcript: TranscriptSegment[];
	summary: string | null;
}

interface UseTranscriptOptions {
	videoId?: string;
	enabled?: boolean;
	generateSummary?: boolean;
}

interface UseTranscriptReturn {
	data: TranscriptData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useTranscript({ videoId, enabled = true, generateSummary = true }: UseTranscriptOptions): UseTranscriptReturn {
	const [data, setData] = useState<TranscriptData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!videoId || !enabled) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				videoId,
				summary: generateSummary.toString()
			});

			const response = await fetch(`/api/youtube/transcript?${params.toString()}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || 'Failed to fetch transcript');
			}

			const result = await response.json();

			if (result.success && result.data) {
				setData(result.data);
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch data');
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [videoId, enabled, generateSummary]);

	const refetch = useCallback(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (videoId && enabled) {
			fetchData();
		}
	}, [fetchData, videoId, enabled]);

	return { data, loading, error, refetch };
}
