// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import PolkadotIcon from '@assets/delegation/polkadot-logo.svg';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaCircleCheck } from 'react-icons/fa6';
import { IoMdLock } from 'react-icons/io';
import styles from './UserWalletData.module.scss';

function UserWalletData() {
	const { user } = useUser();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const pathname = usePathname();

	const { data: userBalances } = useQuery({
		queryKey: ['userBalances', user?.id],
		queryFn: () => apiService?.getUserBalances({ address: user?.loginAddress || '' }),
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
		<div className='px-10'>
			<div className='relative'>
				{!user?.id || !user.loginAddress ? (
					<div className={styles.walletInfoBoard}>
						<span className='text-sm font-medium text-white'>To get started with delegation on polkadot</span>
						<Link
							href={`/login?nextUrl=${pathname}`}
							className='rounded-md bg-border_blue p-2 text-sm font-semibold text-white'
						>
							Connect wallet
						</Link>
					</div>
				) : (
					<div className={styles.walletInfoBoard2}>
						<div className='flex items-center gap-x-10 text-btn_primary_text'>
							<div className='flex flex-col items-center'>
								<span className='text-2xl font-medium'>{balances.balance}</span>
								<span className='flex items-center gap-x-2 text-sm font-medium'>
									<Image
										src={PolkadotIcon}
										alt='polkadot-logo'
										width={16}
										height={16}
									/>{' '}
									Balance
								</span>
							</div>
							<div className='flex flex-col items-center'>
								<span className='text-2xl font-medium'>{balances.transferableBalance}</span>
								<span className='flex items-center gap-x-2 text-sm font-medium'>
									<FaCircleCheck className='text-base text-success' />
									Transferable
								</span>
							</div>
							<div className='flex flex-col items-center'>
								<span className='text-2xl font-medium'>{balances.lockedBalance}</span>
								<span className='flex items-center gap-x-2 text-sm font-medium'>
									<IoMdLock className='text-base text-lock' />
									Total Locked
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
