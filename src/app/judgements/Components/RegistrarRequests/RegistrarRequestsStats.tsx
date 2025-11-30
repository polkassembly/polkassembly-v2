// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { EJudgementStatus } from '@/_shared/types';
import { filterJudgementsByStatus, getRegistrarsWithStats } from '@/app/_client-utils/identityUtils';
import { HandCoins, Scale, TrendingUp } from 'lucide-react';
import { BN } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';

const success = 'text-success';
const failure = 'text-failure';
function RegistrarRequestsStats() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const network = getCurrentNetwork();

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
		<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
			<div className='flex items-center gap-4 rounded-xl border border-primary_border bg-bg_modal p-4'>
				<div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
					<Scale className='h-6 w-6 text-purple-600' />
				</div>
				<div className='flex-1'>
					<p className='text-2xl font-bold text-text_primary'>{stats.pendingRequests}</p>
					<p className='text-sm text-basic_text'>Pending Requests</p>
					<div className='mt-1 flex items-center gap-1'>
						<TrendingUp className={`h-3 w-3 ${stats.pendingRequestsIncrease >= 0 ? success : failure}`} />
						<span className={`text-xs ${stats.pendingRequestsIncrease >= 0 ? success : failure}`}>{stats.pendingRequestsIncrease.toFixed(1)}% this month</span>
					</div>
				</div>
			</div>

			<div className='flex items-center gap-4 rounded-xl border border-primary_border bg-bg_modal p-4'>
				<div className='flex h-12 w-12 items-center justify-center rounded-full bg-pink-100'>
					<Scale className='h-6 w-6 text-pink-600' />
				</div>
				<div className='flex-1'>
					<p className='text-2xl font-bold text-text_primary'>{stats.judgementsGranted}</p>
					<p className='text-sm text-basic_text'>Judgements Granted</p>
					<div className='mt-1 flex items-center gap-1'>
						<TrendingUp className={`h-3 w-3 ${stats.judgementsGrantedIncrease >= 0 ? success : failure}`} />
						<span className={`text-xs ${stats.judgementsGrantedIncrease >= 0 ? success : failure}`}>{stats.judgementsGrantedIncrease.toFixed(1)}% this month</span>
					</div>
				</div>
			</div>

			<div className='flex items-center gap-4 rounded-xl border border-primary_border bg-bg_modal p-4'>
				<div className='flex h-12 w-12 items-center justify-center rounded-full bg-pink-100'>
					<HandCoins className='h-6 w-6 text-pink-600' />
				</div>
				<div className='flex-1'>
					<p className='text-2xl font-bold text-text_primary'>{formatBnBalance(stats.feeEarned, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</p>
					<p className='text-sm text-basic_text'>Fee Earned</p>
					<div className='mt-1 flex items-center gap-1'>
						<TrendingUp className={`h-3 w-3 ${stats.feeEarnedIncrease >= 0 ? success : failure}`} />
						<span className={`text-xs ${stats.feeEarnedIncrease >= 0 ? success : failure}`}>{stats.feeEarnedIncrease.toFixed(1)}% this month</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RegistrarRequestsStats;
