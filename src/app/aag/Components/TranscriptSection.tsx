// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAutoScroll } from '@/hooks/useAAGVideos';

const INITIAL_TRANSCRIPT_DISPLAY_COUNT = 10;

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
	isPlaying?: boolean;
}

function TranscriptSection({ transcript, loading, currentTime = 0, onSeek, isPlaying = false }: TranscriptSectionProps) {
	const t = useTranslations('AAG');
	const [isExpanded, setIsExpanded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const activeSegmentRef = useRef<HTMLDivElement>(null);
	const { setShouldAutoScroll, scrollToElement, enableAutoScroll } = useAutoScroll(containerRef);

	const displayTranscript = useMemo(() => {
		return isExpanded ? transcript : transcript.slice(0, INITIAL_TRANSCRIPT_DISPLAY_COUNT);
	}, [isExpanded, transcript]);

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
			// Enable auto-scroll when user clicks on a transcript segment
			enableAutoScroll();
			onSeek?.(offset);
			// Small delay to ensure the seek happens before auto-scroll
			setTimeout(() => {
				setShouldAutoScroll(true);
			}, 100);
		},
		[onSeek, setShouldAutoScroll, enableAutoScroll]
	);

	useEffect(() => {
		if (!isExpanded && activeSegmentIndex >= INITIAL_TRANSCRIPT_DISPLAY_COUNT) {
			setIsExpanded(true);
		}
	}, [activeSegmentIndex, isExpanded]);

	useEffect(() => {
		if (activeSegmentRef.current && activeSegmentIndex >= 0) {
			// Debug logging in development
			if (process.env.NODE_ENV === 'development') {
				console.log('Auto-scrolling to transcript segment:', activeSegmentIndex, 'at time:', currentTime);
			}
			scrollToElement(activeSegmentRef.current);
		}
	}, [activeSegmentIndex, scrollToElement, currentTime]);

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
				{displayTranscript.map((segment) => {
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
			{transcript.length > INITIAL_TRANSCRIPT_DISPLAY_COUNT && !isPlaying && (
				<button
					type='button'
					onClick={() => setIsExpanded(!isExpanded)}
					className='bg-bg_grey mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-border_grey px-3 py-2 text-xs font-medium text-text_primary transition-colors hover:bg-opacity-80'
				>
					{isExpanded ? (
						<>
							<span>{t('viewLess')}</span>
							<ChevronUp className='h-3 w-3' />
						</>
					) : (
						<>
							<span>
								{t('viewMore')} ({transcript.length - INITIAL_TRANSCRIPT_DISPLAY_COUNT} {t('more')})
							</span>
							<ChevronDown className='h-3 w-3' />
						</>
					)}
				</button>
			)}
		</div>
	);
}

export default TranscriptSection;
