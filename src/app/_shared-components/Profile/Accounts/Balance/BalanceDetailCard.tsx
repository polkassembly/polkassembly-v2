// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import classes from './Balance.module.scss';

function BalanceDetailCard({ title, balance, icon }: { title: string; balance: string; icon: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	return (
		<div className={classes.balanceDetailCard}>
			<Image
				src={icon}
				alt={title}
				width={48}
				height={48}
			/>
			<div className={classes.balanceDetailCardContent}>
				<div className={classes.balanceDetailCardContentItem}>
					<p className={classes.balanceDetailCardContentTitle}>{t(`Profile.${title}`)}</p>
					<div className={classes.balanceDetailCardContentText}>{formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</div>
				</div>
			</div>
		</div>
	);
}

export default BalanceDetailCard;
