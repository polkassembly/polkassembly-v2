// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { EJudgementStatus } from '@/_shared/types';
import { filterJudgementsByStatus, getRegistrarsWithStats } from '@/app/_client-utils/identityUtils';
import { Search as SearchIcon } from 'lucide-react';
import { BN } from '@polkadot/util';
import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import styles from '../Overview/IdentitiesListingTable.module.scss';

function RegistrarRequestsStats() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const network = getCurrentNetwork();
	const router = useRouter();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const [searchValue, setSearchValue] = useState(searchParams?.get('search') || '');

	const { data: registrarData, isLoading } = useQuery({
		queryKey: ['registrar-data', user?.defaultAddress],
		queryFn: async () => {
			if (!user?.defaultAddress || !identityService) return null;
			const [requests, registrars, allJudgements] = await Promise.all([
				identityService.getJudgementRequestsForRegistrar(user.defaultAddress),
				identityService.getRegistrars(),
				identityService.getAllIdentityJudgements()
			]);

			const registrarsWithStats = getRegistrarsWithStats({ registrars, judgements: allJudgements });
			const encodedUserAddress = getEncodedAddress(user.defaultAddress, network);
			const currentRegistrar = registrarsWithStats.find((reg) => getEncodedAddress(reg.address, network) === encodedUserAddress);

			return {
				requests,
				registrarFee: currentRegistrar?.registrarFee || '0'
			};
		},
		enabled: !!user?.defaultAddress && !!identityService
	});

	const stats = useMemo(() => {
		if (!registrarData) {
			return {
				pendingRequests: 0,
				pendingRequestsIncrease: 0,
				judgementsGranted: 0,
				judgementsGrantedIncrease: 0,
				feeEarned: '0',
				feeEarnedIncrease: 0
			};
		}

		const { requests, registrarFee } = registrarData;

		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();
		const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

		const pendingRequests = filterJudgementsByStatus(requests, EJudgementStatus.REQUESTED);
		const grantedRequests = requests.filter((r) => r.status === EJudgementStatus.APPROVED || r.status === EJudgementStatus.REJECTED);

		const currentMonthPending = pendingRequests.filter((r) => {
			const date = new Date(r.dateInitiated);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		});

		const previousMonthPending = pendingRequests.filter((r) => {
			const date = new Date(r.dateInitiated);
			return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
		});

		const currentMonthGranted = grantedRequests.filter((r) => {
			const date = new Date(r.dateInitiated);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		});

		const previousMonthGranted = grantedRequests.filter((r) => {
			const date = new Date(r.dateInitiated);
			return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
		});

		const pendingRequestsIncrease =
			previousMonthPending.length === 0
				? currentMonthPending.length === 0
					? 0
					: 100
				: ((currentMonthPending.length - previousMonthPending.length) / previousMonthPending.length) * 100;

		const judgementsGrantedIncrease =
			previousMonthGranted.length === 0
				? currentMonthGranted.length === 0
					? 0
					: 100
				: ((currentMonthGranted.length - previousMonthGranted.length) / previousMonthGranted.length) * 100;

		const feePerRequest = new BN(registrarFee);
		const feeEarned = feePerRequest.muln(grantedRequests.length);
		const feeEarnedThisMonth = feePerRequest.muln(currentMonthGranted.length);
		const feeEarnedLastMonth = feePerRequest.muln(previousMonthGranted.length);

		const feeEarnedIncrease = feeEarnedLastMonth.isZero()
			? feeEarnedThisMonth.isZero()
				? 0
				: 100
			: Number(feeEarnedThisMonth.sub(feeEarnedLastMonth).muln(100).div(feeEarnedLastMonth));

		return {
			pendingRequests: pendingRequests.length,
			pendingRequestsIncrease,
			judgementsGranted: grantedRequests.length,
			judgementsGrantedIncrease,
			feeEarned: feeEarned.toString(),
			feeEarnedIncrease
		};
	}, [registrarData]);

	if (isLoading) {
		return (
			<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
				<Skeleton className='h-24 w-full' />
				<Skeleton className='h-24 w-full' />
				<Skeleton className='h-24 w-full' />
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.overviewStatsContainer}>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementRequestedIcon}
						alt='Judgement Requests'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.pendingRequests')}</p>
						<p className={styles.statsValue}>
							{isLoading || !identityService ? (
								<Skeleton className='h-6 w-20' />
							) : (
								<div className='flex items-baseline gap-2'>
									<div className='text-2xl font-bold text-text_primary'>{stats.pendingRequests || 0}</div>
									<span className='text-xs font-semibold text-green-500'>
										↑ {stats.pendingRequestsIncrease.toFixed(1)}% <span className='font-normal text-basic_text'>this month</span>
									</span>
								</div>
							)}
						</p>
					</div>
				</div>
				<Separator
					orientation='vertical'
					className='hidden h-11 md:block'
				/>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementCompletedIcon}
						alt='Judgement Completed'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.judgementsGranted')}</p>
						<p className={styles.statsValue}>
							{isLoading || !identityService ? (
								<Skeleton className='h-6 w-20' />
							) : (
								<div className='flex items-baseline gap-2'>
									<div className='text-2xl font-bold text-text_primary'>{stats.judgementsGranted || 0}</div>
									<span className='text-xs font-semibold text-green-500'>
										↑ {stats.judgementsGrantedIncrease.toFixed(1)}% <span className='font-normal text-basic_text'>this month</span>
									</span>
								</div>
							)}
						</p>
					</div>
				</div>
				<Separator
					orientation='vertical'
					className='hidden h-11 md:block'
				/>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementCompletedIcon}
						alt='Judgement Completed'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.feeEarned')}</p>
						<p className={styles.statsValue}>
							{isLoading || !identityService ? (
								<Skeleton className='h-6 w-20' />
							) : (
								<div className='flex items-baseline gap-2'>
									<div className='text-2xl font-bold text-text_primary'>
										{formatBnBalance(stats.feeEarned, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
									</div>
									<span className='text-xs font-semibold text-green-500'>
										↑ {stats.feeEarnedIncrease.toFixed(1)}% <span className='font-normal text-basic_text'>this month</span>
									</span>
								</div>
							)}
						</p>
					</div>
				</div>

				<div className='ml-auto flex items-center gap-2'>
					<div className='relative'>
						<input
							type='text'
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									const params = new URLSearchParams(searchParams?.toString() || '');
									if (searchValue) {
										params.set('search', searchValue);
									} else {
										params.delete('search');
									}
									params.delete('page');
									router.push(`/judgements?${params.toString()}`);
								}
							}}
							placeholder='Enter address or name to search'
							className='bg-bg_card w-60 rounded-lg border border-primary_border px-4 py-2 pl-10 text-xs text-text_primary placeholder-basic_text focus:outline-none focus:ring-2 focus:ring-text_pink'
						/>
						<span className='absolute left-3 top-1/2 -translate-y-1/2 text-basic_text'>
							<SearchIcon size={16} />
						</span>
					</div>
					<button
						type='button'
						className='bg-bg_card !size-9 rounded-lg border border-primary_border p-2 hover:text-text_primary'
						title='Filter'
					>
						<FaFilter className='text-lg text-basic_text' />
					</button>
					<button
						type='button'
						className='bg-bg_card !size-9 rounded-lg border border-primary_border p-1.5 hover:text-text_primary'
						title='Menu'
					>
						<MdSort className='text-2xl text-basic_text' />
					</button>
				</div>
			</div>
		</div>
	);
}

export default RegistrarRequestsStats;
