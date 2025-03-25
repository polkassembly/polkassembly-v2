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
import { BN, formatBalance } from '@polkadot/util';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { ENetwork, IDelegationStats } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import styles from './DelegationSupplyData.module.scss';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

const ZERO_BN = new BN(0);

const parseBalance = (balance: string, decimals: number, withUnit: boolean, network: ENetwork) => {
	let readableBalance = formatUSDWithUnits(
		parseFloat(
			formatBalance(balance, {
				decimals: NETWORKS_DETAILS[network]?.tokenDecimals,
				forceUnit: NETWORKS_DETAILS[network]?.tokenSymbol,
				withAll: false,
				withUnit: false,
				withZero: false
			}).replaceAll(',', '')
		)
			.toFixed(2)
			.toString(),
		decimals
	);
	if (withUnit) {
		readableBalance = `${readableBalance} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol}`;
	}
	return readableBalance;
};

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
			<div className='flex items-center gap-3'>
				<Image
					src={DOT}
					alt='DOT'
					className='h-10 w-10'
				/>
				<div className='flex flex-col'>
					<p className={styles.totalDelegates}>{t('totalSupply')}</p>
					<p className='text-xl font-semibold'>{parseBalance(totalSupply.toString(), 2, true, network)}</p>
				</div>
			</div>
			<div className={styles.borderLeft}>
				<div className='flex items-center gap-3'>
					<Image
						src={tokens}
						alt='Tokens'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('delegatedTokens')}</p>
						<p className='text-xl font-semibold'>{parseBalance(delegationStats.totalDelegatedTokens, 2, true, network)}</p>
					</div>
				</div>
			</div>
			<div className={styles.borderLeft}>
				<div className='flex items-center gap-3'>
					<Image
						src={votes}
						alt='Votes'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegatedVotes')}</p>
						<p className='text-xl font-semibold'>{formatUSDWithUnits(String(delegationStats.totalDelegatedVotes))}</p>
					</div>
				</div>
			</div>
			<div className={styles.borderLeft}>
				<div className='flex items-center gap-3'>
					<Image
						src={delegates}
						alt='Delegates'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegates')}</p>
						<p className='text-xl font-semibold'>{delegationStats?.totalDelegates}</p>
					</div>
				</div>
			</div>
			<div className={styles.borderLeft}>
				<div className='flex items-center gap-3'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className={styles.totalDelegates}>{t('totalDelegatees')}</p>
						<p className='text-xl font-semibold'>{delegationStats?.totalDelegators}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DelegationSupplyData;
