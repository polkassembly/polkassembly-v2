// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const INITIAL_TRANSCRIPT_DISPLAY_COUNT = 10;

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptSectionProps {
	transcript: TranscriptSegment[];
	loading?: boolean;
}
function TranscriptSection({ transcript, loading }: TranscriptSectionProps) {
	const t = useTranslations('AAG');
	const [isExpanded, setIsExpanded] = useState(false);
	const initialDisplayCount = INITIAL_TRANSCRIPT_DISPLAY_COUNT;
	const displayTranscript = isExpanded ? transcript : transcript.slice(0, initialDisplayCount);

	const formatTimestamp = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

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
			<div className='max-h-64 space-y-1.5 overflow-auto'>
				{displayTranscript.map((segment) => (
					<div
						key={`${segment.offset}-${segment.text.substring(0, 20)}`}
						className='hover:bg-bg_grey flex gap-3 rounded p-1.5'
					>
						<span className='min-w-[45px] text-xs font-medium text-bar_chart_purple'>{formatTimestamp(segment.offset)}</span>
						<p className='text-xs leading-relaxed text-wallet_btn_text'>{segment.text}</p>
					</div>
				))}
			</div>
			{transcript.length > initialDisplayCount && (
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
								{t('viewMore')} ({transcript.length - initialDisplayCount} {t('more')})
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
