// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import PolkadotIcon from '@assets/delegation/polkadot-logo.svg';
import Image from 'next/image';
import { FaCheckCircle } from '@react-icons/all-files/fa/FaCheckCircle';
import { IoMdLock } from '@react-icons/all-files/io/IoMdLock';
import { useTranslations } from 'next-intl';
import styles from './UserWalletData.module.scss';

function UserWalletData() {
	const { user } = useUser();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');

	const getUserBalances = useCallback(async () => {
		return apiService?.getUserBalances({ address: user?.loginAddress || '' });
	}, [apiService, user?.loginAddress]);

	const { data: userBalances } = useQuery({
		queryKey: ['userBalances', user?.id],
		queryFn: getUserBalances,
		enabled: !!user?.id && !!user?.loginAddress
	});

	const balances = useMemo(
		() => ({
			balance: formatBnBalance(userBalances?.totalBalance?.toString() || '0', { numberAfterComma: 2, withUnit: true }, network),
			transferableBalance: formatBnBalance(userBalances?.transferableBalance?.toString() || '0', { numberAfterComma: 2, withUnit: true }, network),
			lockedBalance: formatBnBalance(userBalances?.lockedBalance?.toString() || '0', { numberAfterComma: 2, withUnit: true }, network)
		}),
		[userBalances, network]
	);

	return (
		<div className='w-full'>
			<div className='relative w-full'>
				{!user?.id || !user.loginAddress ? (
					<div className={styles.walletInfoBoard}>
						<span className='text-sm font-medium text-white'>{t('toGetStartedWithDelegationOnPolkadot')}</span>
						<Link
							href='/login'
							className='rounded-md bg-border_blue p-2 text-sm font-semibold text-white'
						>
							{t('connectWallet')}
						</Link>
					</div>
				) : (
					<div className={styles.walletInfoBoard2}>
						<div className='flex w-full items-center justify-center gap-2 gap-y-4 py-3 text-btn_primary_text sm:flex-row sm:justify-start sm:gap-x-10 sm:gap-y-0 sm:py-0'>
							<div className='flex flex-col items-center'>
								<span className='text-base font-medium md:text-2xl'>{balances.balance}</span>
								<span className='flex items-center gap-x-2 text-xs font-medium sm:text-sm'>
									<Image
										src={PolkadotIcon}
										alt='polkadot-logo'
										width={16}
										height={16}
									/>{' '}
									{t('balance')}
								</span>
							</div>
							<div className='flex flex-col items-center'>
								<span className='text-base font-medium md:text-2xl'>{balances.transferableBalance}</span>
								<span className='flex items-center gap-x-2 text-xs font-medium sm:text-sm'>
									<FaCheckCircle className='text-base text-success' />
									{t('transferable')}
								</span>
							</div>
							<div className='flex flex-col items-center'>
								<span className='text-base font-medium md:text-2xl'>{balances.lockedBalance}</span>
								<span className='flex items-center gap-x-2 text-xs font-medium sm:text-sm'>
									<IoMdLock className='text-base text-lock' />
									{t('totalLocked')}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default UserWalletData;
