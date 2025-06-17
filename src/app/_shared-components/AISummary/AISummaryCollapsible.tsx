// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAISummary } from '@/hooks/useAISummary';
import { EProposalType, IContentSummary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { THEME_COLORS } from '@/app/_style/theme';
import { Separator } from '../Separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import styles from './AISummaryCollapsible.module.scss';
import { Skeleton } from '../Skeleton';
import { MarkdownViewer } from '../MarkdownViewer/MarkdownViewer';

interface Props {
	proposalType: EProposalType;
	indexOrHash: string;
	summaryType: 'content' | 'allComments';
	initialData?: IContentSummary;
	className?: string;
}

function AISummaryCollapsible({ proposalType, indexOrHash, summaryType, initialData, className }: Props) {
	const t = useTranslations('PostDetails');
	const { data, isLoading, error } = useAISummary({ proposalType, indexOrHash, initialData });

	if (isLoading) {
		return <Skeleton />;
	}

	if (error || !ValidatorService.isValidIndexOrHash(indexOrHash)) return null;

	let summaryContent = null;

	if (summaryType === 'content') {
		summaryContent = data?.postSummary;
	} else if (summaryType === 'allComments') {
		summaryContent = data?.commentsSummary;
	}

	if (!summaryContent) {
		return null;
	}

	return (
		<Collapsible className={`${styles.collapsibleWrapper} ${className}`}>
			<div className={`${styles.collapsibleInner} ${summaryType === 'content' ? styles.postContentGradient : styles.commentContentGradient}`}>
				<CollapsibleTrigger className={styles.collapsibleTrigger}>
					<span>✨ {summaryType === 'content' ? t('aiSummary') : t('commentSummary')}</span>
					<ChevronDown className={styles.chevronIcon} />
				</CollapsibleTrigger>
				<CollapsibleContent className={styles.collapsibleContent}>
					<Separator className='mb-3 mt-0 p-0' />
					<MarkdownViewer
						markdown={summaryContent}
						className={`${THEME_COLORS.light.btn_primary_text}`}
					/>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default AISummaryCollapsible;
