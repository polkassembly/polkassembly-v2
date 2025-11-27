// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { mapJudgementStatus } from '@/app/_client-utils/identityUtils';
import { EJudgementStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { useUser } from '@/hooks/useUser';

function MyIdentitiesDashboard() {
	const { identityService } = useIdentityService();

	const { user } = useUser();

	const { data: myIdentities, isLoading } = useQuery({
		queryKey: ['myIdentities', user?.defaultAddress, identityService],
		queryFn: async () => {
			if (!identityService || !user?.defaultAddress) return null;

			const identities = [];

			const mainIdentity = await identityService.getOnChainIdentity(user.defaultAddress);

			if (mainIdentity.isIdentitySet) {
				const judgements = mainIdentity.judgements.map((judgement) => {
					const judgementArray = [...judgement];
					const judgementStatus = judgementArray[1];
					return mapJudgementStatus(String(judgementStatus));
				});
				const socials = {
					twitter: mainIdentity.twitter,
					email: mainIdentity.email,
					discord: mainIdentity.discord,
					matrix: mainIdentity.matrix,
					github: mainIdentity.github,
					web: mainIdentity.web
				};

				identities.push({
					address: user.defaultAddress,
					displayName: mainIdentity.display,
					type: 'Direct' as const,
					socials,
					judgements: judgements.filter((j: EJudgementStatus) => j === EJudgementStatus.APPROVED || j === EJudgementStatus.REJECTED),
					lastUpdated: new Date(),
					canEdit: true,
					canDelete: true
				});
			}

			const subAddresses = await identityService.getSubIdentities(user.defaultAddress);

			const subIdentitiesData = await Promise.all(
				subAddresses.map(async (subAddress) => {
					const subInfo = await identityService.getSubIdentityInfo(subAddress);
					const subIdentity = await identityService.getOnChainIdentity(subAddress);

					return {
						address: subAddress,
						displayName: subInfo.displayName || subIdentity.display,
						type: 'Sub-identity' as const,
						socials: {
							twitter: subIdentity.twitter,
							email: subIdentity.email,
							discord: subIdentity.discord,
							matrix: subIdentity.matrix,
							github: subIdentity.github,
							web: subIdentity.web
						},
						judgements: [],
						lastUpdated: new Date(),
						canEdit: false,
						canDelete: true
					};
				})
			);

			identities.push(...subIdentitiesData);

			return {
				totalSubIdentities: subAddresses.length,
				percentageThisMonth: 12.8,
				identities
			};
		},
		enabled: !!identityService && !!user?.defaultAddress,
		staleTime: 30000
	});

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-lg bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	if (!myIdentities || myIdentities.identities.length === 0) {
		return (
			<div className='flex items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-12'>
				<div className='text-center'>
					<h3 className='text-xl font-semibold text-text_primary'>No Identity Set</h3>
					<p className='text-text_secondary mt-2'>Set up your on-chain identity to get started</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full'>
			<div className='mb-4 flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold text-text_primary'>My Sub-identities</h2>
				</div>
			</div>

			<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Identity</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Socials</TableHead>
							<TableHead>Judgements</TableHead>
							<TableHead>Last Updated</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{myIdentities.identities.map((identity) => (
							<TableRow key={identity.address}>
								<td className='px-6 py-5'>
									<div className='flex flex-col gap-1'>
										<div className='font-medium'>{identity.displayName || 'Unnamed'}</div>
										<Address
											truncateCharLen={5}
											address={identity.address}
										/>
									</div>
								</td>
								<td className='px-6 py-5'>
									<span className='bg-bg_secondary rounded-full px-3 py-1 text-xs'>{identity.type}</span>
								</td>
								<td className='px-6 py-5'>
									<div className='flex gap-2'>
										{identity.socials.twitter && <span>🐦</span>}
										{identity.socials.email && <span>📧</span>}
										{identity.socials.discord && <span>💬</span>}
										{identity.socials.github && <span>🐙</span>}
										{!identity.socials.twitter && !identity.socials.email && !identity.socials.discord && !identity.socials.github && (
											<span className='text-text_secondary'>-</span>
										)}
									</div>
								</td>
								<td className='px-6 py-5'>
									{identity.judgements.length > 0 ? <span className='text-green-500'>✓ {identity.judgements.length}</span> : <span className='text-text_secondary'>-</span>}
								</td>
								<td className='px-6 py-5'>
									<span className='text-text_secondary text-sm'>{identity.lastUpdated.toLocaleDateString()}</span>
								</td>
								<td className='px-6 py-5'>
									<div className='flex gap-2'>
										{identity.canEdit && (
											<button
												className='text-sm text-text_pink hover:underline'
												type='button'
											>
												Edit
											</button>
										)}
										{identity.canDelete && (
											<button
												className='text-sm text-red-500 hover:underline'
												type='button'
											>
												Delete
											</button>
										)}
									</div>
								</td>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default MyIdentitiesDashboard;
