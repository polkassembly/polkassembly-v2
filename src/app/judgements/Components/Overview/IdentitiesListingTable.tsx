// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo, useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { EJudgementStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import Image from 'next/image';
import ChildListingIndicatorIcon from '@assets/icons/child-listing-indicator.svg';
import ChildListingEndIndicatorIcon from '@assets/icons/child-listing-end-indicator.svg';
import { SocialLinksDisplay, JudgementDisplay } from './IdentityComponents';
import styles from './IdentitiesListingTable.module.scss';

interface IIdentity {
	id: string;
	address: string;
	displayName: string;
	isSubIdentity: boolean;
	parentAddress?: string;
	socials: {
		email?: string;
		twitter?: string;
		discord?: string;
		matrix?: string;
		github?: string;
		web?: string;
	};
	judgements: {
		status: EJudgementStatus;
		count: number;
		quality: string;
		labels: string[];
	};
	subIdentities: IIdentity[];
	subIdentityCount: number;
}

function IdentitiesListingTable() {
	const searchParams = useSearchParams();
	const page = Number(searchParams?.get('page')) || 1;
	const search = searchParams?.get('search') || '';
	const { identityService } = useIdentityService();
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const { data: allIdentities, isLoading } = useQuery<IIdentity[]>({
		queryKey: ['allIdentities', identityService],
		queryFn: async () => {
			if (!identityService) return [];
			return identityService.getAllIdentities();
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

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-3xl border border-primary_border bg-bg_modal p-4'>
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
					<p className='mt-2 text-basic_text'>Try adjusting your search</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full'>
			<div className='w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
				<Table>
					<TableHeader>
						<TableRow className={styles.headerRow}>
							<TableHead className={styles.headerCell}>IDENTITY</TableHead>
							<TableHead className={styles.headerCell}>SOCIALS</TableHead>
							<TableHead className={styles.headerCell}>JUDGEMENTS</TableHead>
							<TableHead className={styles.headerCell}>SUB-IDENTITY</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.map((identity) => (
							<>
								{/* Parent Identity Row */}
								<TableRow
									key={identity.id}
									className={styles.tableRow}
								>
									<td className='py-4 pl-2 pr-6'>
										<div className='flex items-center gap-1'>
											<span className='text-xs text-basic_text'>
												<Address
													iconSize={24}
													address={identity.address}
												/>
											</span>
											<span className='text-xs text-basic_text'>
												({identity.address.slice(0, 6)}...{identity.address.slice(-5)})
											</span>
											<button
												type='button'
												className='text-basic_text hover:text-text_primary'
												title='Copy address'
											>
												<Copy size={14} />
											</button>
										</div>
									</td>
									<td className='px-6 py-4'>
										<SocialLinksDisplay socials={identity.socials} />
									</td>
									<td className='px-6 py-4'>
										<JudgementDisplay
											count={identity.judgements.count}
											labels={identity.judgements.labels}
										/>
									</td>

									<td className='px-6 py-4'>
										<div className='flex items-center gap-2'>
											<span className='text-sm font-semibold text-text_primary'>{identity.subIdentityCount || '-'}</span>
										</div>
									</td>
									<td className='p-4'>
										<div className='flex items-center gap-2'>
											{identity.subIdentityCount > 0 && (
												<button
													type='button'
													onClick={() => toggleExpand(identity.address)}
													className='text-basic_text hover:text-text_primary'
												>
													{expandedRows.has(identity.address) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
												</button>
											)}
										</div>
									</td>
								</TableRow>

								{/* Sub-Identity Rows */}
								{expandedRows.has(identity.address) &&
									identity.subIdentities.map((sub, index: number) => (
										<TableRow
											key={sub.id}
											className={`${styles.subIdentityRow} ${index === identity.subIdentities.length - 1 ? 'border-solid' : 'border-dashed'}`}
										>
											<td className='py-2 pl-2 pr-6'>
												<div className='flex items-center gap-2 pl-3'>
													{identity.subIdentities.length === 1 || index === identity.subIdentities.length - 1 ? (
														<Image
															src={ChildListingEndIndicatorIcon}
															alt='Child Bounty Icon'
															width={20}
															height={19}
															priority
														/>
													) : (
														<Image
															src={ChildListingIndicatorIcon}
															alt='Child Bounty Icon'
															width={20}
															height={24}
															priority
														/>
													)}
													<Identicon
														className='image identicon'
														value={sub.address}
														size={24}
														theme='polkadot'
													/>
													<div className='flex items-center gap-1'>
														<span className='text-sm font-semibold text-text_primary'>{sub.displayName}</span>
														<span className='text-xs text-basic_text'>
															({sub.address.slice(0, 6)}...{sub.address.slice(-5)})
														</span>
														<button
															type='button'
															className='text-basic_text hover:text-text_primary'
															title='Copy address'
														>
															<Copy size={12} />
														</button>
													</div>
												</div>
											</td>
											<td className='px-6 py-2'>
												<SocialLinksDisplay
													socials={sub.socials}
													size='sm'
												/>
											</td>
											<td className='px-6 py-2'>
												<JudgementDisplay
													count={sub.judgements.count}
													labels={sub.judgements.labels}
													size='sm'
												/>
											</td>

											<td className='px-6 py-2'>
												<span className='text-sm text-basic_text'>-</span>
											</td>
											<td className='px-4 py-2' />
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
