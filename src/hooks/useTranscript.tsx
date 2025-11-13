// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';

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

async function fetchTranscript(videoId: string, generateSummary: boolean): Promise<TranscriptData> {
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

	if (!result.success || !result.data) {
		throw new Error('Invalid response format');
	}

	return result.data;
}

export function useTranscript({ videoId, enabled = true, generateSummary = true }: UseTranscriptOptions): UseTranscriptReturn {
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-transcript', videoId, generateSummary],
		queryFn: () => fetchTranscript(videoId!, generateSummary),
		enabled: Boolean(videoId) && enabled,
		staleTime: 15 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		retry: 1
	});

	return {
		data: data || null,
		loading: isLoading,
		error: error ? (error as Error).message : null,
		refetch: () => {
			queryRefetch();
		}
	};
}
