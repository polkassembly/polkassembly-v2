// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { IProxyRequest } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Info } from 'lucide-react';
import Image from 'next/image';
import { FaCaretDown } from '@react-icons/all-files/fa/FaCaretDown';
import { FaCaretUp } from '@react-icons/all-files/fa/FaCaretUp';
import TrailLine from '@assets/icons/trail-line.svg';
import TrailLineEnd from '@assets/icons/trail-line-end.svg';
import { SortDirection } from '@tanstack/react-table';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../_shared-components/Tooltip';
import { LoadingSpinner } from '../../../_shared-components/LoadingSpinner';
import ProxyTypeBadge from '../../../_shared-components/ProxyTypeBadge/ProxyTypeBadge';
import styles from './ListingTable.module.scss';

function ProxyListingTable({ data, totalCount, isLoading }: { data: IProxyRequest[]; totalCount: number; isLoading?: boolean }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const page = searchParams?.get('page') || 1;
	const t = useTranslations('Proxies');
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	// Get sort params from URL
	const sortBy = searchParams?.get('sortBy');
	const sortDirection = searchParams?.get('sortDirection') as SortDirection | null;

	const toggleRow = (proxyId: string) => {
		const newExpandedRows = new Set(expandedRows);
		if (newExpandedRows.has(proxyId)) {
			newExpandedRows.delete(proxyId);
		} else {
			newExpandedRows.add(proxyId);
		}
		setExpandedRows(newExpandedRows);
	};

	const toggleSort = () => {
		const newParams = new URLSearchParams(searchParams.toString());

		// Simple direction cycling: null -> asc -> desc -> null
		const nextDirection = !sortDirection ? 'asc' : sortDirection === 'asc' ? 'desc' : null;

		// Update or remove sorting parameters
		if (nextDirection) {
			newParams.set('sortBy', 'proxies');
			newParams.set('sortDirection', nextDirection);
		} else {
			newParams.delete('sortBy');
			newParams.delete('sortDirection');
		}

		// Preserve other search parameters (if any)
		['page', 'search', 'allSearch'].forEach((param) => {
			const value = searchParams.get(param);
			if (value) newParams.set(param, value);
		});

		router.push(`?${newParams.toString()}`);
	};

	if (isLoading) {
		return (
			<div className='flex w-full items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-6 py-12'>
				<LoadingSpinner
					size='large'
					message='Loading...'
				/>
			</div>
		);
	}

	return (
		<div className='w-full'>
			{data && data.length > 0 ? (
				<>
					<div className='w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
						<Table>
							<TableHeader>
								<TableRow className={styles.tableHeader}>
									<TableHead className={`${styles.tableCell}`} />
									<TableHead className={styles.tableCell_2}>{t('delegator')}</TableHead>
									<TableHead className={styles.tableCell}>{t('proxyType')}</TableHead>
									<TableHead className={styles.tableCell}>
										<div className='flex items-center gap-x-2'>
											{t('delay')}
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Info className='h-4 w-4 text-text_grey' />
													</TooltipTrigger>
													<TooltipContent>
														<p className='max-w-xs'>{t('delayTooltip')}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</TableHead>
									<TableHead className={styles.tableCell_last}>
										<button
											type='button'
											onClick={toggleSort}
											className='flex items-center gap-x-2 focus:outline-none'
										>
											{t('proxies')}
											{sortBy === 'proxies' && sortDirection === 'asc' && <FaCaretUp className='h-4 w-4 text-text_pink' />}
											{sortBy === 'proxies' && sortDirection === 'desc' && <FaCaretDown className='h-4 w-4 text-text_pink' />}
											{(!sortBy || sortBy !== 'proxies' || !sortDirection) && <FaCaretDown className='h-4 w-4 text-text_grey' />}
										</button>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((proxy: IProxyRequest) => {
									const isExpanded = expandedRows.has(proxy.id);
									const hasChildProxies = proxy.individualProxies && proxy.individualProxies.length > 0;

									return (
										<React.Fragment key={proxy?.id}>
											<TableRow
												className={`${hasChildProxies ? 'cursor-pointer hover:bg-section_dark_overlay' : ''}`}
												onClick={() => hasChildProxies && toggleRow(proxy.id)}
											>
												<td className='w-4 px-6 py-5'>
													{hasChildProxies && (
														<button
															type='button'
															className='focus:outline-none'
															onClick={(e) => {
																e.stopPropagation();
																toggleRow(proxy.id);
															}}
														>
															{isExpanded ? <FaCaretUp className='h-4 w-4 text-text_pink' /> : <FaCaretDown className='h-4 w-4 text-text_grey' />}
														</button>
													)}
												</td>
												<td className='px-4 py-5'>
													<Address
														truncateCharLen={5}
														address={proxy.delegator}
														redirectToProfile={false}
													/>
												</td>
												<td className='px-6 py-5' />
												<td className='px-6 py-5' />
												<td className='px-6 py-5'>
													<div className='truncate'>{proxy.proxies}</div>
												</td>
											</TableRow>

											{hasChildProxies &&
												isExpanded &&
												proxy.individualProxies.map((individualProxy, index) => (
													<TableRow
														key={`${proxy.id}-child-${individualProxy.address}`}
														className='border-primary_border bg-sidebar_menu_active'
													>
														<td className='px-6 py-1 text-text_pink'>
															<div className='flex h-10 w-4 items-start'>
																<Image
																	src={index === proxy.individualProxies.length - 1 ? TrailLineEnd : TrailLine}
																	width={10}
																	height={25}
																	className='w-4'
																	alt='trail line'
																/>
															</div>
														</td>
														<td className='px-6 py-1'>
															<Address
																truncateCharLen={5}
																address={individualProxy.address}
															/>
														</td>
														<td className='px-6 py-1'>
															<ProxyTypeBadge proxyType={individualProxy.proxyType} />
														</td>
														<td className='px-6 py-1'>
															<div className='truncate'>{individualProxy.delay || '-'}</div>
														</td>
														<td className='px-6 py-1' />
													</TableRow>
												))}
										</React.Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>
					{Boolean(totalCount) && totalCount > DEFAULT_LISTING_LIMIT && (
						<div className='mt-5 flex w-full justify-end'>
							<PaginationWithLinks
								page={Number(page)}
								pageSize={DEFAULT_LISTING_LIMIT}
								totalCount={totalCount}
								pageSearchParam='page'
							/>
						</div>
					)}
				</>
			) : (
				<div className='flex w-full items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-6 py-12'>
					<h1 className='text-center text-2xl font-bold text-text_primary'>{t('noProxiesFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default ProxyListingTable;
