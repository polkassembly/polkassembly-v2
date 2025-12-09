// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Link from 'next/link';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { Ban } from 'lucide-react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import styles from '../../TrendingDelegates/DelegateCard/DelegateCard.module.scss';

interface IDelegateXCardProps {
	data: {
		votingPower: string;
		ayeCount: number;
		nayCount: number;
		abstainCount: number;
		votesPast30Days: number;
		totalVotingPower: string;
		totalVotesPast30Days: number;
		totalDelegators: number;
	};
	networkSymbol: string;
	isBotSetup: boolean;
	isLoading?: boolean;
}

function DelegateXStats({
	data,
	networkSymbol,
	isBotSetup,
	isLoading = false
}: {
	data: IDelegateXCardProps['data'];
	networkSymbol: string;
	isBotSetup: boolean;
	isLoading?: boolean;
}) {
	const currentNetwork = getCurrentNetwork();

	if (isLoading) {
		return (
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<Skeleton className='mb-2 h-8 w-24' />
						<Skeleton className='h-4 w-20' />
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div className='w-full text-center'>
						<div className='mb-2 flex items-center justify-center gap-4'>
							<Skeleton className='h-6 w-12' />
							<Skeleton className='h-6 w-12' />
							<Skeleton className='h-6 w-12' />
						</div>
						<Skeleton className='mx-auto h-4 w-24' />
					</div>
				</div>
				<div className='p-5 text-center'>
					<Skeleton className='mx-auto mb-2 h-8 w-16' />
					<Skeleton className='mx-auto h-4 w-32' />
				</div>
			</div>
		);
	}

	if (isBotSetup) {
		return (
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
							<span className='font-semibold md:text-2xl'>
								{formatBnBalance(data.votingPower, { compactNotation: true, numberAfterComma: 1, withUnit: false }, currentNetwork)} {networkSymbol}
							</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>Voting Power</span>
					</div>
				</div>

				<div className={styles.delegationCardStatsItem}>
					<div className='w-full text-center'>
						<div className='flex items-center justify-center gap-4'>
							<div className='flex items-center gap-1 text-success'>
								<AiFillLike className='fill-current text-sm' />
								<span className='font-medium'>{data.ayeCount}</span>
							</div>
							<div className='flex items-center gap-1 text-toast_error_text'>
								<AiFillDislike className='fill-current text-sm' />
								<span className='font-medium'>{data.nayCount}</span>
							</div>
							<div className='flex items-center gap-1 text-bg_blue'>
								<Ban size={14} />
								<span className='font-medium'>{data.abstainCount}</span>
							</div>
						</div>
						<span className={styles.delegationCardStatsItemText}>All Votes Casted</span> <br />
						<Link
							href='/delegation/voting-history'
							className='cursor-pointer text-xs font-semibold text-text_pink hover:underline'
						>
							View History
						</Link>
					</div>
				</div>

				<div className='p-5 text-center'>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{data.votesPast30Days}</div>
						<span className={styles.delegationCardStatsItemText}>Votes Casted </span>
						<span className={styles.delegationCardStatsItemTextPast30Days}>(Past 30 Days)</span>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div className='flex flex-col gap-2'>
						<Skeleton className='mx-auto h-8 w-24' />
						<Skeleton className='mx-auto h-4 w-32' />
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div className='flex flex-col gap-2'>
						<Skeleton className='mx-auto h-8 w-16' />
						<Skeleton className='mx-auto h-4 w-32' />
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div className='flex flex-col gap-2'>
						<Skeleton className='mx-auto h-8 w-16' />
						<Skeleton className='mx-auto h-4 w-24' />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.delegationCardStats}>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>
						{formatBnBalance(data.totalVotingPower, { compactNotation: true, numberAfterComma: 1, withUnit: false }, currentNetwork)}{' '}
						<span className='text-text_secondary text-sm font-normal'> {networkSymbol}</span>
					</span>
					<span className='text-text_secondary text-center text-xs'>Total Voting power</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>{data.totalVotesPast30Days}</span>
					<span className='text-text_secondary text-center text-xs'>
						Total Voted proposals
						<br />
						(Past 30 days)
					</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>{data.totalDelegators}</span>
					<span className='text-text_secondary text-center text-xs'>Number of Users</span>
				</div>
			</div>
		</div>
	);
}

export default DelegateXStats;
