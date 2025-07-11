// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { EStatusTagType } from '@/_shared/types';
import styles from './StatusTag.module.scss';

interface Props {
	className?: string;
	status?: string;
	colorInverted?: boolean;
	type?: EStatusTagType;
}

function StatusTag({ className = '', status, colorInverted, type = EStatusTagType.PROPOSAL }: Props) {
	const t = useTranslations();

	const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
	const translationKey = type === EStatusTagType.JUDGEMENT ? 'JudgementStatus' : 'ProposalStatus';

	return (
		<div className={`${styles.base} ${normalizedStatus ? styles[String(normalizedStatus)] : ''} ${colorInverted ? styles.inverted : ''} ${className}`}>
			{t(`${translationKey}.${status?.toLowerCase()}`)}
		</div>
	);
}

export default StatusTag;
