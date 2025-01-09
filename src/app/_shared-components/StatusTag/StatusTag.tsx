// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import { ETheme } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import styles from './StatusTag.module.scss';

interface Props {
	className?: string;
	status: string | undefined;
	colorInverted?: boolean;
}

function StatusTag({ className = '', status, colorInverted }: Props) {
	const { theme } = useTheme();
	const t = useTranslations();

	const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');

	return (
		<div
			// eslint-disable-next-line
			className={`${styles.base} ${normalizedStatus ? styles[normalizedStatus] : ''} ${colorInverted ? styles.inverted : ''} ${
				theme === ETheme.DARK ? styles.dark : styles.light
			} ${className}`}
		>
			{t(`ProposalStatus.${status?.toLowerCase()}`)}
		</div>
	);
}

export default StatusTag;
