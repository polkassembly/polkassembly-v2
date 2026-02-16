// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptSectionProps {
	transcript: TranscriptSegment[];
	loading?: boolean;
	currentTime?: number;
	onSeek?: (time: number) => void;
}

function TranscriptSection({ transcript, loading, currentTime = 0, onSeek }: TranscriptSectionProps) {
	const t = useTranslations('AAG');
	const containerRef = useRef<HTMLDivElement>(null);
	const activeSegmentRef = useRef<HTMLDivElement>(null);

	const activeSegmentIndex = useMemo(() => {
		return transcript.findIndex((segment, index) => {
			const nextSegment = transcript[index + 1];
			const segmentStart = segment.offset;
			const segmentEnd = nextSegment ? nextSegment.offset : segment.offset + segment.duration;
			return currentTime >= segmentStart && currentTime < segmentEnd;
		});
	}, [transcript, currentTime]);

	const formatTimestamp = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}, []);

	const handleSeek = useCallback(
		(offset: number) => {
			onSeek?.(offset);
		},
		[onSeek]
	);

	useEffect(() => {
		if (!containerRef.current || !activeSegmentRef.current || activeSegmentIndex < 0) return undefined;

		const scrollTimeout = setTimeout(() => {
			const container = containerRef.current;
			const activeElement = activeSegmentRef.current;
			if (!container || !activeElement) return;

			const containerRect = container.getBoundingClientRect();
			const elementRect = activeElement.getBoundingClientRect();
			const padding = 10;

			const delta = elementRect.top - containerRect.top;
			const targetTop = container.scrollTop + delta - padding;

			container.scrollTo({
				top: Math.max(0, targetTop),
				behavior: 'smooth'
			});
		}, 50);

		return () => clearTimeout(scrollTimeout);
	}, [activeSegmentIndex]);

	if (loading) {
		return (
			<div>
				<div className='mb-3 flex items-center gap-2'>
					<div className='bg-bg_grey h-4 w-20 animate-pulse rounded' />
				</div>
				<div className='space-y-2'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='bg-bg_grey h-8 animate-pulse rounded'
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-lg p-4'>
			<div className='mb-3 flex items-center justify-between'>
				<h3 className='text-sm font-semibold text-text_primary'>{t('transcript')}</h3>
				<span className='text-xs text-wallet_btn_text'>
					{transcript.length} {t('segments')}
				</span>
			</div>
			<div
				ref={containerRef}
				className='max-h-64 space-y-1.5 overflow-auto'
			>
				{transcript.map((segment) => {
					const isActive = transcript.indexOf(segment) === activeSegmentIndex;
					return (
						<div
							key={`${segment.offset}-${segment.text.substring(0, 20)}`}
							ref={isActive ? activeSegmentRef : null}
							className={`flex cursor-pointer gap-3 rounded p-1.5 transition-colors ${isActive ? 'border border-text_pink bg-bg_light_pink' : 'hover:bg-bg_grey'}`}
							onClick={() => handleSeek(segment.offset)}
							role='button'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSeek(segment.offset);
								}
							}}
						>
							<span className={`min-w-[45px] text-xs font-medium ${isActive ? 'text-text_pink' : 'text-bar_chart_purple'}`}>{formatTimestamp(segment.offset)}</span>
							<p className={`text-xs leading-relaxed ${isActive ? 'font-medium text-text_primary' : 'text-wallet_btn_text'}`}>{segment.text}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default TranscriptSection;
