// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIdentityService } from '@/hooks/useIdentityService';
import { formatBnBalance } from '../_client-utils/formatBnBalance';
import { Skeleton } from './Skeleton';

interface Props {
	address: string;
	onChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	setAvailableBalance?: (pre: string) => void;
	classname?: string;
	showPeopleChainBalance?: boolean;
}
function Balance({ address, onChange, isBalanceUpdated = false, setAvailableBalance, classname, showPeopleChainBalance = false }: Props) {
	const t = useTranslations();
	const [balance, setBalance] = useState<string>('0');
	const [loading, setLoading] = useState(false);

	const { apiService } = usePolkadotApiService();
	const { identityService } = useIdentityService();

	const network = getCurrentNetwork();

	useEffect(() => {
		if (!apiService || !address || showPeopleChainBalance) return;
		setLoading(true);

		(async () => {
			const { freeBalance } = await apiService.getUserBalances({
				address
			});

			setAvailableBalance?.(freeBalance.toString());
			setBalance?.(freeBalance.toString());
			onChange?.(freeBalance.toString());
			setLoading(false);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, isBalanceUpdated]);

	useEffect(() => {
		if (!identityService || !address || !showPeopleChainBalance) return;
		setLoading(true);

		(async () => {
			const { freeBalance } = await identityService.getUserBalances({
				address
			});

			setAvailableBalance?.(freeBalance.toString());
			setBalance?.(freeBalance.toString());
			onChange?.(freeBalance.toString());
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, showPeopleChainBalance]);

	return (
		<div className={cn('flex items-center gap-x-1 text-xs', classname)}>
			<span className={cn('text-placeholder', classname)}>{showPeopleChainBalance ? t('Balance.PeopleChainBalance') : t('Balance.Balance')}: </span>
			<span className={cn('text-text_pink', classname)}>
				{loading ? <Skeleton className='h-4 w-[20px]' /> : formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}
			</span>
		</div>
	);
}

export default Balance;
