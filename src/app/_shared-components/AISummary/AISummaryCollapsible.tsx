'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAISummary } from '@/hooks/useAISummary';
import { EProposalType } from '@/_shared/types';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { Separator } from '../Separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import styles from './AISummaryCollapsible.module.scss';
import { Skeleton } from '../Skeleton';

export enum SummaryType {
	CONTENT = 'content',
	COMMENT = 'comment'
}

interface AISummaryCollapsibleProps {
	proposalType: EProposalType;
	indexOrHash: string;
	summaryType: SummaryType;
}

function AISummaryCollapsible({ proposalType, indexOrHash, summaryType }: AISummaryCollapsibleProps) {
	const t = useTranslations('PostDetails');
	const { data, isLoading, error } = useAISummary({ proposalType, indexOrHash });

	if (isLoading) {
		return <Skeleton />;
	}

	if (error) return null;

	let summaryContent = null;

	if (summaryType === SummaryType.CONTENT) {
		summaryContent = data?.postSummary;
	} else if (summaryType === SummaryType.COMMENT) {
		summaryContent = data?.commentsSummary;
	}

	if (!summaryContent) {
		return null;
	}

	return (
		<Collapsible className={styles.collapsibleWrapper}>
			<div className={`${styles.collapsibleInner} ${summaryType === SummaryType.CONTENT ? styles.postContentGradient : styles.commentContentGradient}`}>
				<CollapsibleTrigger className={styles.collapsibleTrigger}>
					<span>✨ {summaryType === SummaryType.CONTENT ? t('aiSummary') : t('commentSummary')}</span>
					<ChevronDown className={styles.chevronIcon} />
				</CollapsibleTrigger>
				<CollapsibleContent className={styles.collapsibleContent}>
					<Separator className='m-0 p-0' />
					<MarkdownEditor
						markdown={summaryContent}
						readOnly
						className={`${THEME_COLORS.light.btn_primary_text} max-h-full border-none text-sm`}
					/>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default AISummaryCollapsible;
