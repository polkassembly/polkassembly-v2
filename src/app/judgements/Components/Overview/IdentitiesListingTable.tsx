// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { EJudgementStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { mapJudgementStatus } from '@/app/_client-utils/identityUtils';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';

interface IdentityData {
	id: string;
	address: string;
	displayName: string;
	isSubIdentity: boolean;
	parentAddress?: string;
	socials: {
		email: string | undefined;
		twitter: string | undefined;
		discord: string | undefined;
		matrix: string | undefined;
		github: string | undefined;
		web: string | undefined;
	};
	judgements: {
		status: EJudgementStatus;
		count: number;
		quality: string;
	};
	lastUpdated: Date;
	subIdentities: IdentityData[];
	subIdentityCount: number;
}

function IdentitiesListingTable() {
	const searchParams = useSearchParams();
	const page = Number(searchParams?.get('page')) || 1;
	const search = searchParams?.get('search') || '';
	const { identityService } = useIdentityService();
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const { data: allIdentities, isLoading } = useQuery({
		queryKey: ['allIdentities', identityService],
		queryFn: async () => {
			if (!identityService) return [];

			const api = identityService.getApi();
			const identityEntries = await api.query.identity.identityOf.entries();
			const subIdentityEntries = await api.query.identity.subsOf.entries();

			const subIdentityMap = new Map<string, string[]>();
			subIdentityEntries.forEach(([key, value]) => {
				const parentAddress = key.args[0].toString();
				const subsData = value.toJSON() as [string, string[]] | null;
				if (subsData && Array.isArray(subsData[1])) {
					subIdentityMap.set(parentAddress, subsData[1]);
				}
			});

			const identitiesPromises = identityEntries.map(async ([key, value]) => {
				const address = key.args[0].toString();
				const blockHash = value.createdAtHash || (await api.rpc.chain.getBlockHash());
				const timestamp = await api.query.timestamp.now.at(blockHash);
				const lastUpdatedDate = new Date(Number(timestamp.toString()));
				const identityInfo = value.toHuman() as {
					info?: {
						display?: { Raw?: string };
						twitter?: { Raw?: string };
						email?: { Raw?: string };
						discord?: { Raw?: string };
						matrix?: { Raw?: string };
						github?: { Raw?: string };
						web?: { Raw?: string };
					};
					judgements?: Array<[string, string]>;
				};

				if (!identityInfo?.info) return null;

				const socials = {
					email: identityInfo.info.email?.Raw,
					twitter: identityInfo.info.twitter?.Raw,
					discord: identityInfo.info.discord?.Raw,
					matrix: identityInfo.info.matrix?.Raw,
					github: identityInfo.info.github?.Raw,
					web: identityInfo.info.web?.Raw
				};

				let judgementStatus = EJudgementStatus.PENDING;
				let judgementCount = 0;

				if (identityInfo.judgements && Array.isArray(identityInfo.judgements)) {
					const approvedJudgements = identityInfo.judgements.filter((judgement) => {
						const [, judgementData] = judgement;
						const status = mapJudgementStatus(judgementData);
						return status === EJudgementStatus.APPROVED || status === EJudgementStatus.REJECTED;
					});
					judgementCount = approvedJudgements.length;
					if (approvedJudgements.length > 0) {
						const [, lastJudgementData] = approvedJudgements[approvedJudgements.length - 1];
						judgementStatus = mapJudgementStatus(lastJudgementData);
					}
				}

				const subAddresses = subIdentityMap.get(address) || [];
				const subIdentities: IdentityData[] = await Promise.all(
					subAddresses.map(async (subAddress) => {
						const subIdentity = await identityService.getOnChainIdentity(subAddress);
						const subInfo = await identityService.getSubIdentityInfo(subAddress);

						const subJudgements = subIdentity.judgements.map((judgement) => {
							const judgementArray = [...judgement];
							const judgementData = judgementArray[1];
							return mapJudgementStatus(String(judgementData));
						});

						const approvedSubJudgements = subJudgements.filter((j: EJudgementStatus) => j === EJudgementStatus.APPROVED || j === EJudgementStatus.REJECTED);

						return {
							id: subAddress,
							address: subAddress,
							displayName: subInfo.displayName || subIdentity.display || 'Unnamed',
							isSubIdentity: true,
							parentAddress: address,
							socials: {
								email: subIdentity.email,
								twitter: subIdentity.twitter,
								discord: subIdentity.discord,
								matrix: subIdentity.matrix,
								github: subIdentity.github,
								web: subIdentity.web
							},
							judgements: {
								status: approvedSubJudgements[0] || EJudgementStatus.PENDING,
								count: approvedSubJudgements.length,
								quality: 'Reasonable'
							},
							lastUpdated: lastUpdatedDate,
							subIdentities: [],
							subIdentityCount: 0
						};
					})
				);

				return {
					id: address,
					address,
					displayName: identityInfo.info.display?.Raw || 'Noob',
					isSubIdentity: false,
					socials,
					judgements: {
						status: judgementStatus,
						count: judgementCount,
						quality: judgementCount > 0 ? 'Good Quality, Known Good' : 'Reasonable'
					},
					lastUpdated: lastUpdatedDate,
					subIdentities,
					subIdentityCount: subIdentities.length
				};
			});

			const identitiesResults = await Promise.all(identitiesPromises);
			return identitiesResults.filter((identity): identity is IdentityData => identity !== null);
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const filteredIdentities = useMemo(() => {
		if (!allIdentities) return [];
		if (!search || search.trim().length === 0) return allIdentities;

		const searchLower = search.trim().toLowerCase();
		return allIdentities.filter((identity) => identity.address.toLowerCase().includes(searchLower) || identity.displayName.toLowerCase().includes(searchLower));
	}, [allIdentities, search]);

	const paginatedData = useMemo(() => {
		const startIndex = (page - 1) * DEFAULT_LISTING_LIMIT;
		const endIndex = startIndex + DEFAULT_LISTING_LIMIT;
		return filteredIdentities.slice(startIndex, endIndex);
	}, [filteredIdentities, page]);

	const toggleExpand = (address: string) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(address)) {
			newExpanded.delete(address);
		} else {
			newExpanded.add(address);
		}
		setExpandedRows(newExpanded);
	};

	const formatDate = (date: Date) => {
		const day = date.getDate();
		const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
		const month = date.toLocaleDateString('en-US', { month: 'short' });
		const year = date.getFullYear().toString().slice(-2);
		const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
		return `${day}${suffix} ${month}'${year}, ${time}`;
	};

	const getJudgementBadge = (status: EJudgementStatus) => {
		switch (status) {
			case EJudgementStatus.APPROVED:
				return { text: 'Reasonable', color: 'bg-green-500/20 text-green-600' };
			case EJudgementStatus.REJECTED:
				return { text: 'Erroneous', color: 'bg-red-500/20 text-red-600' };
			case EJudgementStatus.REQUESTED:
				return { text: 'Requested', color: 'bg-yellow-500/20 text-yellow-600' };
			default:
				return { text: 'Pending', color: 'bg-gray-500/20 text-gray-600' };
		}
	};

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-lg bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	if (!paginatedData || paginatedData.length === 0) {
		return (
			<div className='flex items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-12'>
				<div className='text-center'>
					<h3 className='text-xl font-semibold text-text_primary'>No Identities Found</h3>
					<p className='text-text_secondary mt-2'>Try adjusting your search</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full'>
			<div className='w-full rounded-lg border border-primary_border bg-bg_modal'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>IDENTITY</TableHead>
							<TableHead>SOCIALS</TableHead>
							<TableHead>JUDGEMENTS</TableHead>
							<TableHead>LATEST UPDATE</TableHead>
							<TableHead>SUB-IDENTITY</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.map((identity) => (
							<>
								{/* Parent Identity Row */}
								<TableRow key={identity.id}>
									<td className='px-6 py-4'>
										<div className='flex items-center gap-2'>
											<div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500'>
												<span className='text-xs font-bold text-white'>🆔</span>
											</div>
											<div className='flex items-center gap-1'>
												<span className='font-medium text-text_primary'>{identity.displayName}</span>
												<span className='text-text_secondary text-xs'>
													<Address address={identity.address} />
												</span>
												<button
													type='button'
													className='text-text_secondary hover:text-text_primary'
													title='Copy address'
												>
													<Copy size={14} />
												</button>
											</div>
										</div>
									</td>
									<td className='px-6 py-4'>
										<div className='flex gap-2'>
											{identity.socials.email && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>📧</span>
												</div>
											)}
											{identity.socials.twitter && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>🐦</span>
												</div>
											)}
											{identity.socials.discord && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>💬</span>
												</div>
											)}
											{identity.socials.matrix && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>⚫</span>
												</div>
											)}
											{identity.socials.github && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>🐙</span>
												</div>
											)}
											{identity.socials.web && (
												<div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20'>
													<span className='text-sm'>🌐</span>
												</div>
											)}
										</div>
									</td>
									<td className='px-6 py-4'>
										{identity.judgements.count > 0 ? (
											<div className='flex items-center gap-1'>
												<span
													className={`rounded px-2 py-1 text-xs font-medium ${getJudgementBadge(identity.judgements.status).color}`}
													title={identity.judgements.quality}
												>
													{getJudgementBadge(identity.judgements.status).text}
												</span>
												<span className='text-xs font-bold text-text_primary'>+{identity.judgements.count}</span>
											</div>
										) : (
											<span className='text-text_secondary'>-</span>
										)}
									</td>
									<td className='px-6 py-4'>
										<div className='text-text_secondary flex items-center gap-1 text-sm'>
											<span>{formatDate(identity.lastUpdated)}</span>
											<span className='text-xs'>⏰</span>
										</div>
									</td>
									<td className='px-6 py-4'>
										<div className='flex items-center gap-2'>
											<span className='font-medium text-text_primary'>{identity.subIdentityCount || '-'}</span>
											{identity.subIdentityCount > 0 && (
												<button
													type='button'
													onClick={() => toggleExpand(identity.address)}
													className='text-text_secondary hover:text-text_primary'
												>
													{expandedRows.has(identity.address) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
												</button>
											)}
										</div>
									</td>
								</TableRow>

								{/* Sub-Identity Rows */}
								{expandedRows.has(identity.address) &&
									identity.subIdentities.map((sub, index) => (
										<TableRow
											key={sub.id}
											className='bg-bg_card'
										>
											<td className='px-6 py-3'>
												<div className='flex items-center gap-2 pl-4'>
													<span className='text-text_secondary'>{index === identity.subIdentities.length - 1 ? '└─' : '├─'}</span>
													<div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400'>
														<span className='text-xs'>🆔</span>
													</div>
													<div className='flex items-center gap-1'>
														<span className='text-sm text-text_primary'>{sub.displayName}</span>
														<span className='text-text_secondary text-xs'>
															({sub.address.slice(0, 6)}...{sub.address.slice(-5)})
														</span>
														<button
															type='button'
															className='text-text_secondary hover:text-text_primary'
															title='Copy address'
														>
															<Copy size={12} />
														</button>
													</div>
												</div>
											</td>
											<td className='px-6 py-3'>
												<div className='flex gap-2'>
													{sub.socials.email && (
														<div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
															<span className='text-xs'>📧</span>
														</div>
													)}
													{sub.socials.twitter && (
														<div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
															<span className='text-xs'>🐦</span>
														</div>
													)}
													{sub.socials.discord && (
														<div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
															<span className='text-xs'>💬</span>
														</div>
													)}
												</div>
											</td>
											<td className='px-6 py-3'>
												{sub.judgements.count > 0 ? (
													<div className='flex items-center gap-1'>
														<span className={`rounded px-2 py-0.5 text-xs font-medium ${getJudgementBadge(sub.judgements.status).color}`}>
															{getJudgementBadge(sub.judgements.status).text}
														</span>
														<span className='text-xs font-bold text-text_primary'>+{sub.judgements.count}</span>
													</div>
												) : (
													<span className='text-text_secondary text-sm'>-</span>
												)}
											</td>
											<td className='px-6 py-3'>
												<div className='text-text_secondary flex items-center gap-1 text-xs'>
													<span>{formatDate(sub.lastUpdated)}</span>
													<span>⏰</span>
												</div>
											</td>
											<td className='px-6 py-3'>
												<span className='text-text_secondary text-sm'>-</span>
											</td>
										</TableRow>
									))}
							</>
						))}
					</TableBody>
				</Table>
			</div>

			{filteredIdentities.length > DEFAULT_LISTING_LIMIT && (
				<div className='mt-5 flex w-full justify-center'>
					<PaginationWithLinks
						page={Number(page)}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={filteredIdentities.length}
						pageSearchParam='page'
					/>
				</div>
			)}
		</div>
	);
}

export default IdentitiesListingTable;
