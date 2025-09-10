// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { EProposalStatus } from '@/_shared/types';
import { useMemo } from 'react';
import { DECIDING_PROPOSAL_STATUSES } from '@/_shared/_constants/decidingProposalStatuses';
import styles from './StatusTag.module.scss';

interface Props {
	className?: string;
	status?: EProposalStatus;
	colorInverted?: boolean;
}

function StatusTag({ className = '', status, colorInverted }: Props) {
	const t = useTranslations();

	const finalStatus = useMemo(() => {
		return status && DECIDING_PROPOSAL_STATUSES.includes(status) ? EProposalStatus.Deciding.toLowerCase() : status?.toLowerCase().replace(/\s+/g, '_');
	}, [status]);

	return (
		<div className={`${styles.base} ${finalStatus ? styles[String(finalStatus)] : ''} ${colorInverted ? styles.inverted : ''} ${className}`}>
			{t(`ProposalStatus.${finalStatus}`)}
		</div>
	);
}

export default StatusTag;
