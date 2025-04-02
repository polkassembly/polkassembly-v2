// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Collapsible } from '@radix-ui/react-collapsible';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAISummary } from '@/hooks/useAISummary';
import { EProposalType } from '@/_shared/types';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { Separator } from '../../Separator';
import { CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';
import styles from './AISummaryCollapsible.module.scss';
import { Skeleton } from '../../Skeleton';

interface CollapsibleDropdownProps {
	proposalType: EProposalType;
	indexOrHash: string;
	isContentSummary?: boolean;
	isCommentsSummary?: boolean;
}

function AISummaryCollapsible({ proposalType, indexOrHash, isContentSummary = false, isCommentsSummary = false }: CollapsibleDropdownProps) {
	const t = useTranslations('PostDetails');

	const { data, isLoading, error } = useAISummary({ proposalType, indexOrHash });

	if (isLoading) {
		return <Skeleton />;
	}

	if (error) return null;

	const postSummary = isContentSummary && data?.postSummary;
	const commentSummary = isCommentsSummary && data?.commentsSummary;
	if (!postSummary && !commentSummary) return null;

	return (
		<Collapsible className={styles.collapsibleWrapper}>
			<div className={`${styles.collapsibleInner} ${isContentSummary ? styles.postContentGradient : styles.commentContentGradient}`}>
				<CollapsibleTrigger className={styles.collapsibleTrigger}>
					<span>✨ {isContentSummary ? t('aiSummary') : t('commentSummary')}</span>
					<ChevronDown className={styles.chevronIcon} />
				</CollapsibleTrigger>
				<CollapsibleContent className={styles.collapsibleContent}>
					<Separator className='m-0 p-0' />
					{isContentSummary && data?.postSummary && (
						<MarkdownEditor
							markdown={data.postSummary}
							readOnly
							className={`${THEME_COLORS.light.btn_primary_text} max-h-full border-none text-sm`}
						/>
					)}
					{isCommentsSummary && data?.commentsSummary && (
						<MarkdownEditor
							markdown={data.commentsSummary}
							readOnly
							className='mt-4 max-h-full border-none'
							contentEditableClassName='p-0'
						/>
					)}
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default AISummaryCollapsible;
