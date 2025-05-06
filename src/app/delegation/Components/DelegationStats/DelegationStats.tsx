// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import DOT from '@assets/delegation/dot.svg';
import tokens from '@assets/delegation/tokens.svg';
import votes from '@assets/delegation/votes.svg';
import delegates from '@assets/delegation/delegates.svg';
import delegatees from '@assets/delegation/delegatees.svg';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { BN } from '@polkadot/util';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { IDelegationStats } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import styles from './DelegationStats.module.scss';

const ZERO_BN = new BN(0);

function DelegationSupplyData({ delegationStats }: { delegationStats: IDelegationStats }) {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');
	const [totalSupply, setTotalSupply] = useState<BN>(ZERO_BN);

	useEffect(() => {
		const fetchSupply = async () => {
			if (!apiService) return;

			try {
				await apiService.apiReady();

				const supply = await apiService.getTotalActiveIssuance();
				if (supply) {
					setTotalSupply(supply);
				}
			} catch (err) {
				console.error('Error fetching total supply:', err);
			}
		};

		fetchSupply();
	}, [apiService]);

	return (
		<div className={styles.delegationSupplyDataContainer}>
			<div className={styles.topRow}>
				<div className={styles.delegationSupplyData}>
					<Image
						src={DOT}
						alt='DOT'
						className={styles.delegationSupplyDataImage}
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalSupply')}</p>
						<p className='text-sm font-semibold lg:text-xl'>
							{formatUSDWithUnits(formatBnBalance(totalSupply, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 2)}
						</p>
					</div>
				</div>
				<div className={`${styles.delegationSupplyData} ${styles.borderLeft}`}>
					<Image
						src={tokens}
						alt='Tokens'
						className={styles.delegationSupplyDataImage}
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('delegatedTokens')}</p>
						<p className='text-sm font-semibold lg:text-xl'>
							{formatUSDWithUnits(formatBnBalance(delegationStats.totalDelegatedTokens, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 2)}
						</p>
					</div>
				</div>
				<div className={`${styles.delegationSupplyData} ${styles.borderLeft}`}>
					<Image
						src={votes}
						alt='Votes'
						className={styles.delegationSupplyDataImage}
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegatedVotes')}</p>
						<p className='text-sm font-semibold lg:text-xl'>{formatUSDWithUnits(String(delegationStats.totalDelegatedVotes))}</p>
					</div>
				</div>
			</div>
			<div className={styles.bottomRow}>
				<div className={`${styles.delegationSupplyData} ${styles.borderLeftTotalDelegatedVotes}`}>
					<Image
						src={delegates}
						alt='Delegates'
						className={styles.delegationSupplyDataImage}
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegates')}</p>
						<p className='text-sm font-semibold lg:text-xl'>{delegationStats?.totalDelegates}</p>
					</div>
				</div>
				<div className={`${styles.delegationSupplyData} ${styles.borderLeft}`}>
					<Image
						src={delegatees}
						alt='Delegatees'
						className={styles.delegationSupplyDataImage}
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegators')}</p>
						<p className='text-sm font-semibold lg:text-xl'>{delegationStats?.totalDelegators}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DelegationSupplyData;
