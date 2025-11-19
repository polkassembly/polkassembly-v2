// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import NoActivity from '@assets/activityfeed/gifs/noactivity.gif';
import Image from 'next/image';
import { EProposalStatus } from '@/_shared/types';
import VotingHistoryTable from './Components/VotingHistoryTable';

function VotingHistoryPage() {
	const t = useTranslations();

	const POLKASSEMBLY_URL = 'https://polkassembly.io';

	const votingHistory = [
		{
			id: 45,
			title: 'Standard Guidelines Standard Guidelines ...',
			track: 'Medium Spender',
			decision: 'Nay',
			decisionIcon: 'nay',
			timestamp: "12th June'25, 23:23:12",
			status: EProposalStatus.Rejected,
			criteria: [
				{ met: true, text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
				{ met: true, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
				{ met: false, text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
				{ met: true, text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
				{ met: false, text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
			],
			keyReason: 'Milestones defined and budget within track range.',
			commentUrl: POLKASSEMBLY_URL,
			expanded: true
		},
		{
			id: 46,
			title: 'Accessibility Standards Ensuring all users ...',
			track: 'Small Spender',
			decision: 'Aye',
			decisionIcon: 'aye',
			timestamp: "13th June'25, 09:15:45",
			status: EProposalStatus.Deciding,
			criteria: [
				{ met: true, text: 'Requirements scoped and community feedback incorporated.' },
				{ met: true, text: 'Budget justified with milestones.' },
				{ met: true, text: 'Risks identified and mitigations proposed.' },
				{ met: false, text: 'Security audit pending.' },
				{ met: true, text: 'KPIs and success metrics clearly defined.' }
			],
			keyReason: 'Clear milestones and strong community support.',
			commentUrl: POLKASSEMBLY_URL,
			expanded: false
		},
		{
			id: 47,
			title: 'Responsive Design Adapting layouts for var ...',
			track: 'Big Spender',
			decision: 'Abstain',
			decisionIcon: 'abstain',
			timestamp: "14th June'25, 14:30:11",
			status: EProposalStatus.Approved,
			criteria: [
				{ met: true, text: 'Team experience verified.' },
				{ met: true, text: 'Budget within reasonable limits.' },
				{ met: true, text: 'Detailed roadmap provided.' },
				{ met: true, text: 'Community feedback addressed.' },
				{ met: false, text: 'Maintenance plan to be refined.' }
			],
			keyReason: 'Overall strong proposal; abstained due to conflict of interest.',
			commentUrl: POLKASSEMBLY_URL,
			expanded: false
		}
	];

	return (
		<div className='min-h-screen'>
			<div className='flex flex-col gap-2 bg-bg_modal px-20 py-8 text-text_primary shadow-lg'>
				<p className='text-[28px] font-semibold'>Voting History</p>
				<p className='text-sm font-medium'>Every vote is auditable. Click a proposal to see which criteria were met and the delegate’s reasoning.</p>
				<Link
					href='https://wiki.polkadot.com/general/glossary/#referendum'
					target='_blank'
					rel='noopener noreferrer'
					className='flex items-center gap-x-1 text-sm font-medium text-text_pink underline'
				>
					{t('ActivityFeed.PostItem.readMore')} <ArrowUpRightFromSquareIcon className='h-3.5 w-3.5' />
				</Link>{' '}
			</div>

			{votingHistory && votingHistory.length === 0 ? (
				<div className='flex flex-col items-center justify-center pt-6'>
					<div className='flex max-w-3xl flex-col items-center text-center'>
						<Image
							src={NoActivity}
							alt='empty state'
							className='h-80 w-80 p-0'
							width={320}
							height={320}
						/>{' '}
						<p className='pb-3 text-xl font-semibold text-text_primary'>
							No votes yet — Delegate X will record results as soon as
							<br /> new referenda arrive.
						</p>
						<Link
							href='/delegation'
							className='w-full rounded-lg bg-bg_pink px-6 py-3 text-center text-sm font-semibold text-btn_primary_text hover:bg-opacity-90'
						>
							View Dashboard
						</Link>
					</div>
				</div>
			) : (
				<div className='px-4 py-6 md:px-20'>
					<VotingHistoryTable votingHistory={votingHistory} />
				</div>
			)}
		</div>
	);
}

export default VotingHistoryPage;
