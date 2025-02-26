// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { Card, CardContent } from '@ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/Table';
import { MdInfoOutline } from 'react-icons/md';
import Calendar from '@ui/calendar';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, EProposalStatus, IGenericListingResponse, IPostListing } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { useRouter } from 'next/navigation';
import { aboutSocialLinks } from '@shared/_constants/AboutSocialLinks';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import AboutSocialLinks from './AboutSocialLinks';
import styles from './Overview.module.scss';
import NewsSection from './NewsSection';
import SpendPeriod from './SpendPeriod';

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
		price: string;
	};
}) {
	const network = getCurrentNetwork() as ENetwork;
	const router = useRouter();

	return (
		<div>
			<h1 className='mb-4 text-2xl font-semibold text-btn_secondary_text'>Overview</h1>

			{/* About Section */}
			<Card className='border-none bg-bg_modal p-4 shadow-lg'>
				<CardContent className='p-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xl font-semibold text-btn_secondary_text'>About</p>
						<span className='hidden lg:block'>
							<AboutSocialLinks links={aboutSocialLinks} />
						</span>
					</div>
					<p className='mt-5 text-sm text-btn_secondary_text'>
						Join our Community to discuss, contribute and get regular updates from us! <span className='cursor-pointer text-bg_pink'>View Gallery</span>
					</p>
					<span className='block pt-3 lg:hidden'>
						<AboutSocialLinks links={aboutSocialLinks} />
					</span>
				</CardContent>
			</Card>

			{/* Treasury and Spend Period */}
			<div className='mt-6 grid gap-4 lg:grid-cols-2'>
				<Card className='border-none bg-bg_modal p-4 shadow-lg'>
					<CardContent className='p-3'>
						<p className='text-sm text-wallet_btn_text'>
							Treasury <MdInfoOutline className='inline-block text-lg' />
						</p>
						<div className='mt-4 flex items-center justify-center'>
							<p className='text-sm text-btn_secondary_text'>Coming Soon..</p>
						</div>
					</CardContent>
				</Card>
				<SpendPeriod tokenPrice={tokenPrice} />
			</div>

			{/* Latest Activity */}
			<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
				<h2 className='mb-4 text-lg font-semibold text-btn_secondary_text'>Latest Activity</h2>
				<Tabs defaultValue='all'>
					<TabsList className='hide_scrollbar w-full justify-start overflow-x-auto border-b border-border_grey'>
						<TabsTrigger
							showBorder
							className='px-4 py-2 text-btn_secondary_text'
							value='all'
						>
							All <span className='ml-1 text-xs'>({trackDetails?.all?.totalCount || 0})</span>
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2 text-btn_secondary_text'
							value='discussion'
						>
							Discussion <span className='ml-1 text-xs'>({trackDetails?.discussion?.totalCount || 0})</span>
						</TabsTrigger>
						{Object.keys(NETWORKS_DETAILS[network as ENetwork]?.trackDetails || {}).map((key) => (
							<TabsTrigger
								showBorder
								className='px-4 py-2 text-btn_secondary_text'
								value={key}
								key={key}
							>
								{key} <span className='ml-1 text-xs'>({trackDetails?.tracks?.find((track) => track.trackName === key)?.data?.totalCount || 0})</span>
							</TabsTrigger>
						))}
					</TabsList>
					{/* "All" Tab */}
					<TabsContent value='all'>
						<Table className='mt-4'>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>#</TableHead>
									<TableHead className={styles.tableCell_2}>Title</TableHead>
									<TableHead className={styles.tableCell}>Posted by</TableHead>
									<TableHead className={styles.tableCell}>Created</TableHead>
									<TableHead className={styles.tableCell}>Origin</TableHead>
									<TableHead className={styles.tableCell_last}>Status</TableHead>
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
											No activity data found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TabsContent>

					{/* "Discussion" Tab */}
					<TabsContent value='discussion'>
						<Table className='mt-4'>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>#</TableHead>
									<TableHead className={styles.tableCell_2}>Title</TableHead>
									<TableHead className={styles.tableCell}>Posted by</TableHead>
									<TableHead className={styles.tableCell}>Created</TableHead>
									<TableHead className={styles.tableCell}>Origin</TableHead>
									<TableHead className={styles.tableCell_last}>Status</TableHead>
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
											No discussion posts found
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
										<TableHead className={styles.tableCell_2}>Title</TableHead>
										<TableHead className={styles.tableCell}>Posted by</TableHead>
										<TableHead className={styles.tableCell}>Created</TableHead>
										<TableHead className={styles.tableCell}>Origin</TableHead>
										<TableHead className={styles.tableCell_status}>Status</TableHead>
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
												No {track.trackName} activity found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TabsContent>
					))}
				</Tabs>
			</div>
			<div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
				{/* Upcoming Events */}
				<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg lg:col-span-1'>
					<h2 className='mb-4 text-lg font-semibold text-btn_secondary_text'>Upcoming Events</h2>
					<Calendar />
					<p className='mt-4 text-xs text-text_grey'>*DateTime in UTC</p>
				</div>
				{/* News */}

				<NewsSection twitter='https://x.com/polkadot' />
			</div>
		</div>
	);
}

export default Overview;
