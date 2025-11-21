// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { EProposalStatus } from '@/_shared/types';
import { DECIDING_PROPOSAL_STATUSES } from '@/_shared/_constants/decidingProposalStatuses';

import styles from './StatusTag.module.scss';

interface Props {
	className?: string;
	status?: EProposalStatus;
	colorInverted?: boolean;
}

function StatusTag({ className = '', status, colorInverted = false }: Props) {
	const t = useTranslations();

	const normalizedStatus = useMemo(() => {
		if (!status) return undefined;

		if (DECIDING_PROPOSAL_STATUSES.includes(status as EProposalStatus)) {
			return EProposalStatus.Deciding.toLowerCase();
		}

		return status.toLowerCase().replace(/\s+/g, '_');
	}, [status]);

	return (
		<div className={` ${styles.base} ${normalizedStatus ? styles[String(normalizedStatus)] : ''} ${colorInverted ? styles.inverted : ''} ${className} `}>
			{normalizedStatus && t(`ProposalStatus.${normalizedStatus}`)}
		</div>
	);
}

export default StatusTag;
