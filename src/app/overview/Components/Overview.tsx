// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/Table';
import { MdInfoOutline } from 'react-icons/md';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, EProposalStatus, IGenericListingResponse, IPostListing } from '@/_shared/types';
import Address from '@ui/Profile/Address/Address';
import { useRouter } from 'next/navigation';
import { aboutSocialLinks } from '@shared/_constants/AboutSocialLinks';
import StatusTag from '@ui/StatusTag/StatusTag';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import AboutSocialLinks from './AboutSocialLinks/AboutSocialLinks';
import styles from './Overview.module.scss';
import NewsSection from './NewsSection/NewsSection';
import SpendPeriod from '../SpendPeriod/SpendPeriod';
import CalendarEvents from './CalendarEvents/CalendarEvents';

enum EOverviewTabs {
	All = 'all',
	Discussion = 'discussion'
}

function Overview({
	trackDetails,
	tokenPrice
}: {
	trackDetails: {
		all: IGenericListingResponse<IPostListing> | null;
		discussion: IGenericListingResponse<IPostListing> | null;
		tracks: { trackName: string; data: IGenericListingResponse<IPostListing> | null }[];
	};
	tokenPrice: {
		price: string | undefined;
	};
}) {
	const network = getCurrentNetwork();
	const router = useRouter();
	const t = useTranslations('Overview');

	return (
		<div className={styles.overview_container}>
			<h1 className={styles.overview_title}>{t('overview')}</h1>

			{/* About Section */}
			<div className='border-none bg-bg_modal p-4 shadow-lg'>
				<div className='p-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xl font-semibold text-btn_secondary_text'>{t('about')}</p>
						{aboutSocialLinks[network as ENetwork].length > 0 && (
							<span className='hidden lg:block'>
								<AboutSocialLinks links={aboutSocialLinks[network as ENetwork]} />
							</span>
						)}
					</div>
					<p className='mt-5 text-sm text-btn_secondary_text'>
						{t('joinCommunity')} <span className='cursor-pointer text-bg_pink'>{t('viewGallery')}</span>
					</p>
					{aboutSocialLinks[network as ENetwork].length > 0 && (
						<span className='block pt-3 lg:hidden'>
							<AboutSocialLinks links={aboutSocialLinks[network as ENetwork]} />
						</span>
					)}
				</div>
			</div>

			{/* Treasury and Spend Period */}
			<div className='mt-6 grid gap-4 lg:grid-cols-2'>
				<div className='border-none bg-bg_modal p-4 shadow-lg'>
					<div className='p-3'>
						<p className='text-sm text-wallet_btn_text'>
							{t('treasury')} <MdInfoOutline className='inline-block text-lg' />
						</p>
						<div className='mt-4 flex items-center justify-center'>
							<p className='text-sm text-btn_secondary_text'>{t('comingSoon')}</p>
						</div>
					</div>
				</div>
				<SpendPeriod tokenPrice={tokenPrice} />
			</div>

			{/* Latest Activity */}
			<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
				<h2 className={styles.latest_activity_title}>{t('latestActivity')}</h2>
				<Tabs defaultValue={EOverviewTabs.All}>
					<TabsList className={cn(styles.tabList, 'hide_scrollbar')}>
						<TabsTrigger
							showBorder
							className={styles.tabTrigger}
							value={EOverviewTabs.All}
						>
							{t('all')} <span className='ml-1 text-xs'>({trackDetails?.all?.totalCount || 0})</span>
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className={styles.tabTrigger}
							value={EOverviewTabs.Discussion}
						>
							{t('discussion')} <span className='ml-1 text-xs'>({trackDetails?.discussion?.totalCount || 0})</span>
						</TabsTrigger>
						{Object.keys(NETWORKS_DETAILS[network as ENetwork]?.trackDetails || {}).map((key) => (
							<TabsTrigger
								showBorder
								className={styles.tabTrigger}
								value={key}
								key={key}
							>
								{key} <span className='ml-1 text-xs'>({trackDetails?.tracks?.find((track) => track.trackName === key)?.data?.totalCount || 0})</span>
							</TabsTrigger>
						))}
					</TabsList>
					{/* "All" Tab */}
					<TabsContent value={EOverviewTabs.All}>
						<Table className='mt-4'>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>#</TableHead>
									<TableHead className={styles.tableCell_2}>{t('title')}</TableHead>
									<TableHead className={styles.tableCell}>{t('postedBy')}</TableHead>
									<TableHead className={styles.tableCell}>{t('created')}</TableHead>
									<TableHead className={styles.tableCell}>{t('origin')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{trackDetails?.all?.items && trackDetails.all.items.length > 0 ? (
									trackDetails.all.items.map((row) => (
										<TableRow
											className='cursor-pointer'
											onClick={() => router.push(`/referenda/${row.index}`)}
											key={row.index}
										>
											<TableCell className={styles.tableCell}>{row.index}</TableCell>
											<TableCell className={styles.tableCell_title}>{row.title}</TableCell>
											<TableCell className={styles.tableCell}>
												<Address address={row.onChainInfo?.proposer || ''} />
											</TableCell>
											<TableCell className={styles.tableCell}>{row.onChainInfo?.createdAt ? new Date(row.onChainInfo.createdAt).toLocaleString() : 'N/A'}</TableCell>
											<TableCell className={styles.tableCell}>{row.onChainInfo?.origin || 'N/A'}</TableCell>
											<TableCell className={styles.tableCell_status}>
												<StatusTag
													className='text-center'
													status={row.onChainInfo?.status === EProposalStatus.DecisionDepositPlaced ? 'Deciding' : row.onChainInfo?.status}
												/>
											</TableCell>
										</TableRow>
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
						<Table className='mt-4'>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>#</TableHead>
									<TableHead className={styles.tableCell_2}>{t('title')}</TableHead>
									<TableHead className={styles.tableCell}>{t('postedBy')}</TableHead>
									<TableHead className={styles.tableCell}>{t('created')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{trackDetails?.discussion?.items && trackDetails.discussion.items.length > 0 ? (
									trackDetails.discussion.items.map((row) => (
										<TableRow
											className='cursor-pointer'
											onClick={() => router.push(`/referenda/${row.index}`)}
											key={row.index}
										>
											<TableCell className={styles.tableCell}>{row.index}</TableCell>
											<TableCell className={styles.tableCell_title}>{row.title}</TableCell>
											<TableCell className={styles.tableCell}>
												<Address address={row.onChainInfo?.proposer || ''} />
											</TableCell>
											<TableCell className={styles.tableCell}>{row.onChainInfo?.createdAt ? dayjs.utc(row.onChainInfo?.createdAt).fromNow() : 'N/A'}</TableCell>
											<TableCell className={styles.tableCell}>{row.onChainInfo?.origin || 'N/A'}</TableCell>
											<TableCell className={styles.tableCell_status}>
												<StatusTag
													className='text-center'
													status={row.onChainInfo?.status === EProposalStatus.DecisionDepositPlaced ? 'Deciding' : row.onChainInfo?.status}
												/>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={6}
											className='text-center'
										>
											{t('nodiscussionposts')}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TabsContent>

					{/* Individual Track Tabs */}
					{trackDetails?.tracks?.map((track) => (
						<TabsContent
							key={track.trackName}
							value={track.trackName}
						>
							<Table className='mt-4'>
								<TableHeader>
									<TableRow className={styles.tableRow}>
										<TableHead className={styles.tableCell_1}>#</TableHead>
										<TableHead className={styles.tableCell_2}>{t('title')}</TableHead>
										<TableHead className={styles.tableCell}>{t('postedBy')}</TableHead>
										<TableHead className={styles.tableCell}>{t('created')}</TableHead>
										<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{track?.data?.items && track.data.items.length > 0 ? (
										track.data.items.map((row) => (
											<TableRow
												className='cursor-pointer'
												key={row.index}
												onClick={() => router.push(`/referenda/${row.index}`)}
											>
												<TableCell className={styles.tableCell}>{row.index}</TableCell>
												<TableCell className={styles.tableCell_title}>{row.title}</TableCell>
												<TableCell className={styles.tableCell}>
													<Address address={row.onChainInfo?.proposer || ''} />
												</TableCell>
												<TableCell className={styles.tableCell}>{row.onChainInfo?.createdAt ? dayjs.utc(row.onChainInfo?.createdAt).fromNow() : 'N/A'}</TableCell>
												<TableCell className={styles.tableCell}>{row.onChainInfo?.origin || 'N/A'}</TableCell>
												<TableCell className={styles.tableCell_status}>
													<StatusTag
														className='text-center'
														status={row.onChainInfo?.status === EProposalStatus.DecisionDepositPlaced ? 'Deciding' : row.onChainInfo?.status}
													/>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center'
											>
												{t('no')} {track.trackName} {t('activityfound')}
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TabsContent>
					))}
				</Tabs>
			</div>
			<div className='mt-6 flex flex-col gap-4 xl:flex-row'>
				{/* Upcoming Events */}
				<div className='w-full xl:w-2/3'>
					<CalendarEvents />
				</div>
				{/* News Section */}
				<div className='w-full xl:w-1/3'>
					<NewsSection />
				</div>
			</div>
		</div>
	);
}

export default Overview;
