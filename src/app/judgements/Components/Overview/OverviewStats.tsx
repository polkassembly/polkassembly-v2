// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { countSocialsFromIdentity, mapJudgementStatus } from '@/app/_client-utils/identityUtils';
import { EJudgementStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';

function OverviewStats() {
	const { identityService } = useIdentityService();

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
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<div className='rounded-lg border border-primary_border bg-bg_modal p-6'>
				<div className='text-text_secondary text-sm'>Unique Identities</div>
				<div className='mt-2 text-3xl font-bold text-text_primary'>{overviewData?.uniqueIdentities || 0}</div>
				<div className='mt-1 text-xs text-text_pink'>+{overviewData?.percentageThisMonth.toFixed(1)}% this month</div>
			</div>

			<div className='rounded-lg border border-primary_border bg-bg_modal p-6'>
				<div className='text-text_secondary text-sm'>Sub Identities</div>
				<div className='mt-2 text-3xl font-bold text-text_primary'>{overviewData?.totalSubIdentities || 0}</div>
			</div>

			<div className='rounded-lg border border-primary_border bg-bg_modal p-6'>
				<div className='text-text_secondary text-sm'>Total Socials</div>
				<div className='mt-2 text-3xl font-bold text-text_primary'>{overviewData?.totalSocials || 0}</div>
			</div>

			<div className='rounded-lg border border-primary_border bg-bg_modal p-6'>
				<div className='text-text_secondary text-sm'>Judgements Given</div>
				<div className='mt-2 text-3xl font-bold text-text_primary'>{overviewData?.totalJudgementsGiven || 0}</div>
			</div>
		</div>
	);
}

export default OverviewStats;
