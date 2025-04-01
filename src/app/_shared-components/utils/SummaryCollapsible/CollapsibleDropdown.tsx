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
import { Separator } from '../../Separator';
import { CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';
import styles from './CollapsibleDropdown.module.scss';
import { useTranslations } from 'next-intl';

interface CollapsibleDropdownProps {
	proposalType: EProposalType;
	indexOrHash?: string;
	usedInPostContent?: boolean;
	usedInComments?: boolean;
}

function CollapsibleDropdown({ proposalType, indexOrHash, usedInPostContent = false, usedInComments = false }: CollapsibleDropdownProps) {
	const t = useTranslations();
	const { summary, loading, error } = useAISummary({ proposalType, indexOrHash: indexOrHash ?? '' });

	if (error || loading) return null;

	const postSummary = usedInPostContent && summary?.postSummary;
	const commentSummary = usedInComments && summary?.commentsSummary;
	if (!postSummary && !commentSummary) return null;

	return (
		<Collapsible className={styles.collapsibleWrapper}>
			<div className={`${styles.collapsibleInner} ${usedInPostContent ? styles.postContentGradient : styles.commentContentGradient}`}>
				<CollapsibleTrigger className={styles.collapsibleTrigger}>
					<span>✨ {usedInPostContent ? t('PostDetails.commentSummary') : t('PostDetails.aiSummary')}</span>
					<ChevronDown className={styles.chevronIcon} />
				</CollapsibleTrigger>
				<CollapsibleContent className={styles.collapsibleContent}>
					<Separator className='m-0 p-0' />
					{usedInPostContent && summary?.postSummary && (
						<MarkdownEditor
							markdown={summary.postSummary}
							readOnly
							className={`${THEME_COLORS.light.btn_primary_text} max-h-full border-none text-sm`}
						/>
					)}
					{usedInComments && summary?.commentsSummary && (
						<MarkdownEditor
							markdown={summary.commentsSummary}
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

export default CollapsibleDropdown;
