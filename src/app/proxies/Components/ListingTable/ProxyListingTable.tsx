// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { IProxyRequest } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../_shared-components/Tooltip';
import ProxyTypeBadge from '../../../_shared-components/ProxyTypeBadge/ProxyTypeBadge';
import styles from './ListingTable.module.scss';

function ProxyListingTable({ data, totalCount }: { data: IProxyRequest[]; totalCount: number }) {
	const searchParams = useSearchParams();
	const page = searchParams?.get('page') || 1;
	const t = useTranslations('Proxies');
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const toggleRow = (proxyId: string) => {
		const newExpandedRows = new Set(expandedRows);
		if (newExpandedRows.has(proxyId)) {
			newExpandedRows.delete(proxyId);
		} else {
			newExpandedRows.add(proxyId);
		}
		setExpandedRows(newExpandedRows);
	};

	return (
		<div className='w-full'>
			{data && data.length > 0 ? (
				<>
					<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
						<Table>
							<TableHeader>
								<TableRow className={styles.tableRow}>
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
									<TableHead className={styles.tableCell_last}>{t('proxies')}</TableHead>
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
												<td className='px-6 py-5'>
													<div className='flex items-center gap-2'>
														{hasChildProxies && (
															<button
																type='button'
																className='focus:outline-none'
																onClick={(e) => {
																	e.stopPropagation();
																	toggleRow(proxy.id);
																}}
															>
																{isExpanded ? <ChevronUp className='h-4 w-4 text-text_grey' /> : <ChevronDown className='h-4 w-4 text-text_grey' />}
															</button>
														)}
														<Address
															truncateCharLen={5}
															address={proxy.delegator}
														/>
													</div>
												</td>
												<td className='px-6 py-5' />
												<td className='px-6 py-5' />
												<td className='px-6 py-5'>
													<div className='truncate'>{proxy.proxies}</div>
												</td>
											</TableRow>

											{hasChildProxies &&
												isExpanded &&
												proxy.individualProxies.map((individualProxy) => (
													<TableRow
														key={`${proxy.id}-child-${individualProxy.address}`}
														className='border-l-4 border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/20'
													>
														<td className='px-6 py-3'>
															<Address
																truncateCharLen={5}
																address={individualProxy.address}
															/>
														</td>
														<td className='px-6 py-3'>
															<ProxyTypeBadge proxyType={individualProxy.proxyType} />
														</td>
														<td className='px-6 py-3'>
															<div className='truncate'>{proxy.delay || '-'}</div>
														</td>
														<td className='px-6 py-3' />
													</TableRow>
												))}
										</React.Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>
					{totalCount && totalCount > DEFAULT_LISTING_LIMIT && (
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
				<div className='flex items-center justify-center'>
					<h1 className='text-center text-2xl font-bold text-text_primary'>{t('noProxiesFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default ProxyListingTable;
