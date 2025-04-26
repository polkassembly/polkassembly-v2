// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin, IGenericListingResponse, IPostListing } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';

import { parseCamelCase } from '@/app/_client-utils/parseCamelCase';
import Link from 'next/link';
import DiscussionsTab from './DiscussionsTab';
import TrackTabs from './TrackTabs';

enum EOverviewTabs {
	All = 'all',
	Discussion = 'discussion'
}

const parseTabnameforUrl = (tab: string) => {
	// Convert camelCase to kebab-case
	return tab.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

function LatestActivity({ allTracksData }: { allTracksData: IGenericListingResponse<IPostListing> | null }) {
	const t = useTranslations('Overview');
	const network = getCurrentNetwork();

	const DATE_FORMAT = "Do MMM 'YY";

	const [selectedTab, setSelectedTab] = useState<string>(EOverviewTabs.All);

	const tracks = NETWORKS_DETAILS[`${network}`]?.trackDetails || {};

	return (
		<div className='whitespace-nowrap'>
			<div className='mb-4 flex items-center justify-between gap-x-2'>
				<h2 className='text-xl font-semibold tracking-tight text-btn_secondary_text'>{t('latestActivity')}</h2>
				<Link
					href={`/${parseTabnameforUrl(selectedTab)}`}
					className='text-medium text-sm text-text_pink'
				>
					{t('viewAll')}
				</Link>
			</div>
			<Tabs
				value={selectedTab}
				onValueChange={setSelectedTab}
			>
				<TabsList className='hide_scrollbar mb-4 flex w-full justify-start overflow-x-auto'>
					<TabsTrigger
						showBorder
						className='text-xm border-b border-b-border_grey font-medium text-text_primary data-[state=active]:border-b-0'
						value={EOverviewTabs.All}
					>
						{t('all')} <span className='ml-1 text-xs'>({allTracksData?.totalCount || 0})</span>
					</TabsTrigger>
					<TabsTrigger
						showBorder
						className='text-xm border-b border-b-border_grey font-medium text-text_primary data-[state=active]:border-b-0'
						value={EOverviewTabs.Discussion}
					>
						{t('discussion')}
					</TabsTrigger>
					{Object.keys(NETWORKS_DETAILS[`${network}`]?.trackDetails || {}).map((key) => (
						<TabsTrigger
							showBorder
							className='text-xm border-b border-b-border_grey font-medium text-text_primary data-[state=active]:border-b-0'
							value={key}
							key={key}
						>
							{parseCamelCase(key)}
						</TabsTrigger>
					))}
				</TabsList>
				{/* "All" Tab */}
				<TabsContent value={EOverviewTabs.All}>
					<Table className='text_text_primary text-sm'>
						<TableHeader>
							<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
								<TableHead className='py-4'>#</TableHead>
								<TableHead className='py-4'>{t('title')}</TableHead>
								<TableHead className='py-4'>{t('postedBy')}</TableHead>
								<TableHead className='py-4'>{t('created')}</TableHead>
								<TableHead className='py-4'>{t('origin')}</TableHead>
								<TableHead className='py-4 text-right'>{t('status')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{allTracksData?.items && allTracksData.items.length > 0 ? (
								allTracksData.items.map((row) => (
									<Link
										href={`/referenda/${row.index}`}
										key={row.index}
										className='contents'
									>
										<TableRow key={row.index}>
											<TableCell className='py-4'>{row.index}</TableCell>
											<TableCell className='max-w-[300px] truncate py-4'>{row.title}</TableCell>
											<TableCell className='truncate py-4'>{row.onChainInfo?.proposer && <Address address={row.onChainInfo.proposer} />}</TableCell>
											<TableCell className='py-4'>{row.onChainInfo?.createdAt && dayjs(row.onChainInfo.createdAt).format(DATE_FORMAT)}</TableCell>
											<TableCell className='py-4'>{row.onChainInfo?.origin && parseCamelCase(row.onChainInfo?.origin)}</TableCell>
											<TableCell className='flex justify-end py-4'>
												<StatusTag
													className='w-max'
													status={row.onChainInfo?.status}
												/>
											</TableCell>
										</TableRow>
									</Link>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={6}
										className='text-center'
									>
										{t('noactivity')}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TabsContent>

				{/* "Discussion" Tab */}
				<TabsContent value={EOverviewTabs.Discussion}>
					<DiscussionsTab />
				</TabsContent>

				{/* Individual Track Tabs */}
				{Object.keys(tracks).map((track) => (
					<TabsContent
						key={track}
						value={track}
					>
						<TrackTabs trackName={track as EPostOrigin} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

export default LatestActivity;
