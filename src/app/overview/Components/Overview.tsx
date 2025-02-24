// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Card, CardContent } from '@ui/card';
import { Tabs, TabsList, TabsTrigger } from '@ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/Table';
import { MdInfoOutline } from 'react-icons/md';
import Calendar from '@ui/calendar';
import { aboutSocialLinks } from '@shared/_constants/AboutSocialLinks';
import AboutSocialLinks from './AboutSocialLinks';
import styles from './Overview.module.scss';
import NewsSection from './NewsSection';
import SpendPeriod from './SpendPeriod';

const MOCK_TITLE = 'Omni: Polkadot Enterprise desktop app Treasury Proposal';
const MOCK_AUTHOR = 'Markian | Supercolony';
const MOCK_DATE = "23rd Dec '22";
const MOCK_STATUS = 'Proposed';

const mockActivityData = [
	{ id: '1234', title: MOCK_TITLE, author: MOCK_AUTHOR, date: MOCK_DATE, status: MOCK_STATUS },
	{ id: '1235', title: MOCK_TITLE, author: MOCK_AUTHOR, date: MOCK_DATE, status: MOCK_STATUS },
	{ id: '1236', title: MOCK_TITLE, author: MOCK_AUTHOR, date: MOCK_DATE, status: MOCK_STATUS },
	{ id: '1237', title: MOCK_TITLE, author: MOCK_AUTHOR, date: MOCK_DATE, status: MOCK_STATUS },
	{ id: '1238', title: MOCK_TITLE, author: MOCK_AUTHOR, date: MOCK_DATE, status: MOCK_STATUS }
];

function Overview() {
	return (
		<div>
			<h1 className='mb-4 text-2xl font-semibold text-btn_secondary_text'>Overview</h1>

			{/* About Section */}
			<Card className='border-none bg-bg_modal p-4 shadow-lg'>
				<CardContent className='p-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xl font-semibold text-btn_secondary_text'>About</p>
						<AboutSocialLinks links={aboutSocialLinks} />
					</div>
					<p className='mt-5 text-sm text-btn_secondary_text'>
						Join our Community to discuss, contribute and get regular updates from us! <span className='cursor-pointer text-bg_pink'>View Gallery</span>
					</p>
				</CardContent>
			</Card>

			{/* Treasury and Spend Period */}
			<div className='mt-6 grid grid-cols-2 gap-4'>
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
				<SpendPeriod />
			</div>

			{/* Latest Activity */}
			<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
				<h2 className='mb-4 text-lg font-semibold'>Latest Activity</h2>
				<Tabs defaultValue='referenda'>
					<TabsList className='hide_scrollbar w-full justify-start overflow-x-auto border-b border-border_grey'>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='referenda'
						>
							Referenda (23)
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='proposals'
						>
							Proposals (12)
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='motions'
						>
							Motions (34)
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='treasury'
						>
							Treasury Proposals (56)
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='bounties'
						>
							Bounties (2)
						</TabsTrigger>
						<TabsTrigger
							showBorder
							className='px-4 py-2'
							value='tips'
						>
							Tips (3)
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Activity Table */}
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
						{mockActivityData.map((row) => (
							<TableRow key={row.id}>
								<TableCell className={styles.tableCell}>#{row.id}</TableCell>
								<TableCell className={styles.tableCell}>{row.title}</TableCell>
								<TableCell className={styles.tableCell}>{row.author}</TableCell>
								<TableCell className={styles.tableCell}>{row.date}</TableCell>
								<TableCell className={styles.tableCell}>{row.status}</TableCell>
								<TableCell className={styles.tableCell}>{row.status}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				{/* Upcoming Events */}
				<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
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
