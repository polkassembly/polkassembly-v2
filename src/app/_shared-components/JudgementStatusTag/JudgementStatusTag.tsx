// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { EJudgementStatus } from '@/_shared/types';
import styles from './JudgementStatusTag.module.scss';

interface Props {
	className?: string;
	status?: EJudgementStatus;
}

function JudgementStatusTag({ className = '', status }: Props) {
	const t = useTranslations();

	const normalizedStatus = useMemo(() => {
		if (!status) return undefined;
		return status.toLowerCase().replace(/\s+/g, '_');
	}, [status]);

	return (
		<div className={` ${styles.base} ${normalizedStatus ? styles[String(normalizedStatus)] : ''} ${className} `}>
			{normalizedStatus && t(`JudgementStatus.${normalizedStatus}`)}
		</div>
	);
}

export default JudgementStatusTag;
