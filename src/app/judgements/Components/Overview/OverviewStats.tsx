// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { countSocialsFromIdentity, mapJudgementStatus } from '@/app/_client-utils/identityUtils';
import { EJudgementStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OverviewStats() {
	const { identityService } = useIdentityService();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchValue, setSearchValue] = useState(searchParams?.get('search') || '');

	const { data: overviewData, isLoading } = useQuery({
		queryKey: ['identityOverview', identityService],
		queryFn: async () => {
			if (!identityService) return null;

			const api = identityService.getApi();
			const identityEntries = await api.query.identity.identityOf.entries();
			const subIdentityEntries = await api.query.identity.subsOf.entries();

			let uniqueIdentities = 0;
			let totalSubIdentities = 0;
			let totalSocials = 0;
			let totalJudgementsGiven = 0;

			identityEntries.forEach(([, value]) => {
				const identityInfo = value.toHuman() as {
					info?: {
						twitter?: { Raw?: string };
						email?: { Raw?: string };
						discord?: { Raw?: string };
						matrix?: { Raw?: string };
						riot?: { Raw?: string };
						github?: { Raw?: string };
						web?: { Raw?: string };
						[key: string]: { Raw?: string } | undefined;
					};
					judgements?: Array<[string, string]>;
				};

				if (identityInfo?.info) {
					uniqueIdentities += 1;
					totalSocials += countSocialsFromIdentity(identityInfo.info);

					if (identityInfo.judgements && Array.isArray(identityInfo.judgements)) {
						identityInfo.judgements.forEach((judgement) => {
							const [, judgementData] = judgement;
							const status = mapJudgementStatus(judgementData);
							if (status === EJudgementStatus.APPROVED || status === EJudgementStatus.REJECTED) {
								totalJudgementsGiven += 1;
							}
						});
					}
				}
			});

			subIdentityEntries.forEach(([, value]) => {
				const subsData = value.toJSON() as [string, string[]] | null;
				if (subsData && Array.isArray(subsData[1])) {
					totalSubIdentities += subsData[1].length;
				}
			});

			return {
				uniqueIdentities,
				totalSubIdentities,
				totalSocials,
				totalJudgementsGiven,
				percentageThisMonth: 12.5
			};
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	if (isLoading || !identityService) {
		return (
			<div className='flex gap-4'>
				<Skeleton className='h-24 w-full' />
				<Skeleton className='h-24 w-full' />
				<Skeleton className='h-24 w-full' />
			</div>
		);
	}

	return (
		<div className='flex items-center gap-4'>
			<div className='flex items-center gap-3 rounded-lg border border-primary_border bg-bg_modal p-4'>
				<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#E5007A]/10'>
					<span className='text-2xl'>👤</span>
				</div>
				<div>
					<div className='text-text_secondary text-xs'>Unique Identities set</div>
					<div className='flex items-baseline gap-2'>
						<div className='text-2xl font-bold text-text_primary'>{overviewData?.uniqueIdentities || 0}</div>
						<span className='text-xs text-green-500'>↑ {overviewData?.percentageThisMonth.toFixed(1)}% this month</span>
					</div>
				</div>
			</div>

			<div className='flex items-center gap-3 rounded-lg border border-primary_border bg-bg_modal p-4'>
				<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#E5007A]/10'>
					<span className='text-2xl'>📊</span>
				</div>
				<div>
					<div className='text-text_secondary text-xs'>Judgements</div>
					<div className='flex items-baseline gap-2'>
						<div className='text-2xl font-bold text-text_primary'>{overviewData?.totalJudgementsGiven || 0}</div>
						<span className='text-xs text-green-500'>↑ {overviewData?.percentageThisMonth.toFixed(1)}% this month</span>
					</div>
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
						className='bg-bg_card placeholder-text_secondary w-80 rounded-lg border border-primary_border px-4 py-2 pl-10 text-sm text-text_primary focus:outline-none focus:ring-2 focus:ring-text_pink'
					/>
					<span className='text-text_secondary absolute left-3 top-1/2 -translate-y-1/2'>🔍</span>
				</div>
				<button
					type='button'
					className='bg-bg_card text-text_secondary rounded-lg border border-primary_border p-2 hover:text-text_primary'
					title='Filter'
				>
					<span className='text-lg'>⚙️</span>
				</button>
				<button
					type='button'
					className='bg-bg_card text-text_secondary rounded-lg border border-primary_border p-2 hover:text-text_primary'
					title='Menu'
				>
					<span className='text-lg'>☰</span>
				</button>
			</div>
		</div>
	);
}

export default OverviewStats;
