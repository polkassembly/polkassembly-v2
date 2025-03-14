// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import React, { useEffect, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Separator } from '@/app/_shared-components/Separator';
import { LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Address from '../../Address/Address';
import classes from './Account.module.scss';

function Account({ address }: { address: string }) {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();

	const [balance, setBalance] = useState<string>('0');
	const [balanceLocked, setBalanceLocked] = useState<string>('0');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!apiService || !address) return;
		setLoading(true);

		(async () => {
			const { freeBalance, lockedBalance } = await apiService.getUserBalances({
				address
			});

			setBalance?.(freeBalance.toString());
			setBalanceLocked?.(lockedBalance.toString());
			setLoading(false);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);
	return (
		<div className={classes.accountWrapper}>
			<Identicon
				value={address}
				size={80}
				theme='polkadot'
			/>
			<div className={classes.accountDetails}>
				<Address
					address={address}
					textClassName='font-semibold text-lg lg:text-xl'
					showIdenticon={false}
				/>
				<div className={classes.accountBalance}>
					<div className={classes.accountBalanceWrapper}>
						<p className='text-xs text-wallet_btn_text'>{t('Profile.balance')}</p>
						<div className={classes.accountBalanceText}>
							{loading ? <Skeleton className='h-4 w-5' /> : formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}
						</div>
					</div>
					<Separator
						orientation='vertical'
						className='h-10'
					/>
					<div className={classes.accountBalanceWrapper}>
						<p className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
							<LockKeyhole
								size={12}
								className='text-yellow_primary'
							/>
							{t('Profile.locked')}
						</p>
						<div className={classes.accountBalanceText}>
							{loading ? <Skeleton className='h-4 w-5' /> : formatBnBalance(balanceLocked, { numberAfterComma: 2, withUnit: true }, network)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Account;
