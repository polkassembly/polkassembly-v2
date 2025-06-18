// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Separator } from '@/app/_shared-components/Separator';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import TransferableIcon from '@/_assets/icons/tranferable-balance.svg';
import LockedIcon from '@/_assets/icons/locked-balance.svg';
import ReservedIcon from '@/_assets/icons/reserved-balance.svg';
import classes from './Balance.module.scss';
import BalanceDetailCard from './BalanceDetailCard';

interface IBalanceDetails {
	lockedBalance: string;
	reservedBalance: string;
	transferableBalance: string;
}

function Balance({ address }: { address: string }) {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();

	const [balanceDetails, setBalanceDetails] = useState<IBalanceDetails>({
		lockedBalance: '0',
		reservedBalance: '0',
		transferableBalance: '0'
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!apiService || !address) return;
		setLoading(true);

		(async () => {
			const { lockedBalance, reservedBalance, transferableBalance } = await apiService.getUserBalances({
				address
			});

			setBalanceDetails({
				lockedBalance: lockedBalance.toString(),
				reservedBalance: reservedBalance.toString(),
				transferableBalance: transferableBalance.toString()
			});
			setLoading(false);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);
	return (
		<div className={classes.balanceWrapper}>
			<div className={classes.balanceTitleWrapper}>
				<h3 className={classes.balanceTitle}>{t('Profile.myBalance')}</h3>
				<button
					type='button'
					className={classes.unlockBalanceButton}
				>
					<UnlockKeyhole className='h-4 w-4 text-border_blue' />
					{t('Profile.unlock')} {t('Profile.in')} {t('Profile.days')} {t('Profile.hours')}
				</button>
			</div>
			{loading ? (
				<div className={classes.balanceDetailCardWrapper}>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</div>
			) : (
				<div className={classes.balanceDetailCardWrapper}>
					<BalanceDetailCard
						title='transferable'
						balance={balanceDetails.transferableBalance}
						icon={TransferableIcon}
					/>
					<Separator
						orientation='horizontal'
						className='h-px w-full bg-border_grey'
					/>
					<BalanceDetailCard
						title='locked'
						balance={balanceDetails.lockedBalance}
						icon={LockedIcon}
					/>
					<Separator
						orientation='horizontal'
						className='h-px w-full bg-border_grey'
					/>
					<BalanceDetailCard
						title='reserved'
						balance={balanceDetails.reservedBalance}
						icon={ReservedIcon}
					/>
				</div>
			)}
		</div>
	);
}

export default Balance;
