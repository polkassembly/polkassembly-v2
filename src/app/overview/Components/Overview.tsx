// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Card, CardContent } from '@ui/card';
import { Progress } from '@ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/Table';
import { TiHome } from 'react-icons/ti';
import { FaTwitter, FaYoutube, FaRedditAlien } from 'react-icons/fa6';
import { RiDiscordFill } from 'react-icons/ri';
import { TbBrandGithubFilled } from 'react-icons/tb';
import { FaTelegramPlane } from 'react-icons/fa';
import { IoIosCube } from 'react-icons/io';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import Calendar from '@ui/calendar';
import AboutSocialLinks, { AboutSocialLink } from './AboutSocialLinks';
import styles from './Overview.module.scss';
import AboutNewsSection from './AboutNewsSection';

const socialLinks: AboutSocialLink[] = [
	{
		icon: TiHome,
		name: 'HomePage',
		url: 'https://your-homepage-url.com'
	},
	{
		icon: FaTwitter,
		name: 'Twitter',
		url: 'https://twitter.com/your-handle'
	},
	{
		icon: RiDiscordFill,
		name: 'Discord',
		url: 'https://discord.gg/your-server'
	},
	{
		icon: TbBrandGithubFilled,
		name: 'Github',
		url: 'https://github.com/your-org'
	},
	{
		icon: FaYoutube,
		name: 'Youtube',
		url: 'https://youtube.com/your-channel'
	},
	{
		icon: FaRedditAlien,
		name: 'Reddit',
		url: 'https://reddit.com/r/your-subreddit'
	},
	{
		icon: FaTelegramPlane,
		name: 'Telegram',
		url: 'https://t.me/your-channel'
	},
	{
		icon: IoIosCube,
		name: 'Block Explorer',
		url: 'https://your-block-explorer.com'
	}
];

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
	const { apiService } = usePolkadotApiService();

	const [spendPeriod, setSpendPeriod] = useState<{ percentage: number; value: { days: number; hours: number; minutes: number; total: number } } | null>(null);

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			const data = await apiService?.getSpendPeriod();
			setSpendPeriod(data);
		})();
	}, [apiService]);
	return (
		<div className='p-6'>
			<h1 className='mb-4 text-2xl font-semibold text-btn_secondary_text'>Overview</h1>

			{/* About Section */}
			<Card className='border-none bg-bg_modal p-4 shadow-lg'>
				<CardContent className='p-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xl font-semibold text-btn_secondary_text'>About</p>
						<AboutSocialLinks links={socialLinks} />
					</div>
					<p className='mt-4 text-sm font-medium text-btn_secondary_text'>
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
						{/* <p className='mt-1 text-gray-600'>25.26M DOT - $129.85M</p>
						<p className='text-gray-600'>DOT Price: $6.17 (12% ↑)</p> */}
					</CardContent>
				</Card>
				<Card className='border-none bg-bg_modal p-4 shadow-lg'>
					<CardContent className='p-3'>
						<p className='text-sm text-wallet_btn_text'>
							Spend Period Remaining <MdInfoOutline className='inline-block text-lg' />
						</p>
						<p className='text-xs text-wallet_btn_text'>
							<span className='text-lg font-medium text-btn_secondary_text'>{spendPeriod?.value.hours}</span> hrs{' '}
							<span className='text-lg font-medium text-btn_secondary_text'>{spendPeriod?.value.minutes}</span> mins / {spendPeriod?.value.total} days
						</p>
						<div className='mt-2 flex items-center gap-2'>
							<Progress
								value={spendPeriod?.percentage}
								className='bg-progress_default'
								indicatorClassName='bg-text_pink'
							/>
							<p className='text-xs font-medium text-btn_secondary_text'>{spendPeriod?.percentage}%</p>
						</div>
						<hr className='my-3 border-border_grey' />
						<div className='flex items-center gap-3'>
							<div className='flex flex-col'>
								<p className='text-xs text-wallet_btn_text'>Next Burn</p>
								<div className='flex items-center gap-2'>
									<p className='whitespace-nowrap text-lg font-medium text-btn_secondary_text'>
										16K <span className='text-base text-input_text'>DOT</span>
									</p>
									<p className='whitespace-nowrap text-xs font-medium text-input_text'>~ $1.30M</p>
								</div>
							</div>
							<div className='rounded-md bg-info_card_bg p-2'>
								<p className='text-xs'>If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.</p>
							</div>
						</div>
					</CardContent>
				</Card>
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

				<AboutNewsSection twitter='https://x.com/polkadot' />
			</div>
		</div>
	);
}

export default Overview;
