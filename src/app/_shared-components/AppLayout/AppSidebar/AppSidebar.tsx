// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PaLogoDark from '@assets/logos/PALogoDark.svg';
import PaLogo from '@ui/AppLayout/PaLogo';
import Head1 from '@assets/sidebar/head1.svg';
import Head2 from '@assets/sidebar/head2.svg';
import Head3 from '@assets/sidebar/head3.svg';
import Head4 from '@assets/sidebar/head4.svg';
import Foot1 from '@assets/sidebar/foot1.svg';
import Foot2 from '@assets/sidebar/foot2.svg';
import Foot3 from '@assets/sidebar/foot3.svg';
import Foot4 from '@assets/sidebar/foot4.svg';
import Home from '@assets/sidebar/homeicon.svg';
import Discussion from '@assets/sidebar/discussion.svg';
import Preimages from '@assets/sidebar/preimages.svg';
import Delegation from '@assets/sidebar/delegation.svg';
import Bounty from '@assets/sidebar/bounty.svg';
import BatchVoting from '@assets/sidebar/batch-voting.svg';
import GovAnalytics from '@assets/sidebar/gov-analytics-icon.svg';
import CautionIcon from '@assets/sidebar/caution-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import CalendarIcon from '@assets/sidebar/calendar-icon.svg';
import CommunityIcon from '@assets/sidebar/community-icon.svg';
import ParachainsIcon from '@assets/sidebar/parachains-icon.svg';
import ArchivedIcon from '@assets/sidebar/archived-icon.svg';
import AdministrationIcon from '@assets/sidebar/admin-icon.svg';
import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasurerIcon from '@assets/sidebar/treasurer-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import ReferendumCancellorIcon from '@assets/sidebar/referendum-cancellor-icon.svg';
import ReferendumKillerIcon from '@assets/sidebar/referendum-killer-icon.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import FellowshipAdminIcon from '@assets/sidebar/fellowship-admin-icon.svg';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@ui/Sidebar';
import DynamicImageGrid from '../DynamicImageGrid';
import { NavMain } from '../NavItems/NavItems';
import CreateProposalDropdownButton from '../CreateProposalDropdownButton/CreateProposalDropdownButton';
import style from './AppSidebar.module.scss';

function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const { resolvedTheme: theme } = useTheme();

	const getLogo = () => {
		if (theme === 'light') {
			return <PaLogo variant={state === 'collapsed' ? 'compact' : 'full'} />;
		}
		if (state === 'expanded') {
			return (
				<Image
					src={PaLogoDark}
					alt='Polkassembly Logo'
				/>
			);
		}
		return <PaLogo variant='compact' />;
	};

	const generateGridData = (data: { src: string; alt: string; bgColor: string; tooltip: string }[]) => (
		<DynamicImageGrid
			items={data}
			rowSize={2}
			tooltipPosition='top'
			isExpanded={state === 'expanded'}
		/>
	);

	const data = [
		{
			initalItems: [
				{ title: 'Home', url: '/home', icon: Home, isActive: true },
				{ title: 'Discussions', url: '/discussions', icon: Discussion },
				{ title: 'Preimages', url: '/preimages', icon: Preimages },
				{ title: 'Delegation', url: '/delegation', icon: Delegation },
				{
					title: 'Bounty',
					url: '/bounty',
					icon: Bounty,
					isNew: true,
					items: [
						{ title: 'Bounty Dashboard', url: '/bounty/dashboard', count: 8 },
						{ title: 'On-chain Bounties', url: '/bounty/onchain' }
					]
				},
				{ title: 'Batch Voting', url: '/batch-voting', icon: BatchVoting, isNew: true },
				{
					title: 'Gov Analytics',
					url: '/gov-analytics',
					icon: GovAnalytics,
					isNew: true
				}
			],
			mainItems: [
				{
					heading: 'TRACKS',
					title: 'TRACKS',
					url: '',
					icon: Head4,
					items: [
						{
							title: 'Treasury',
							url: '',
							icon: TreasuryIcon,
							items: [
								{ title: 'Big Spender', url: '/big-spender', count: 5 },
								{ title: 'Medium Spender', url: '/medium-spender', count: 5 },
								{ title: 'Small Spender', url: '/small-spender', count: 5 },
								{ title: 'Big Tipper', url: '/big-tipper', count: 5 },
								{ title: 'Small Tipper', url: '/small-tipper', count: 5 }
							]
						},
						{
							title: 'Administration',
							url: '',
							icon: AdministrationIcon,
							items: [
								{ title: 'Auction Admin', url: '/big-spender', count: 10 },
								{ title: 'General Admin', url: '/medium-spender', count: 10 },
								{ title: 'Lease Admin', url: '/small-spender', count: 10 },
								{ title: 'Staking Admin', url: '/big-tipper', count: 10 }
							]
						}
					]
				},
				{
					heading: 'ORIGINS',
					title: 'ORIGINS',
					url: '',
					icon: Head4,
					items: [
						{ title: 'Root', url: '/root', count: 5, icon: RootIcon },
						{ title: 'Treasurer', url: '/treasurer', count: 5, icon: TreasurerIcon },
						{ title: 'Wish for change', url: '/wish-for-change', count: 5, icon: WishForChangeIcon },
						{ title: 'Referendum Cancellor', url: '/referendum-cancellor', icon: ReferendumCancellorIcon },
						{ title: 'Referendum Killer', url: '/referendum-killer', count: 5, icon: ReferendumKillerIcon },
						{ title: 'Whitelisted Caller', url: '/whitelist-caller', count: 5, icon: WhitelistedCallerIcon },
						{ title: 'Fellowship Admin', url: '/fellowship-admin', count: 5, icon: FellowshipAdminIcon }
					]
				}
			],
			endItems: [
				{
					title: 'Gov Analytics',
					url: '/gov-analytics',
					icon: GovAnalytics
				},
				{
					title: 'Calendar',
					url: '/calendar',
					icon: CalendarIcon
				},
				{
					title: 'Community',
					url: '/community',
					icon: CommunityIcon,
					items: [
						{ title: 'Members', url: '/Members' },
						{ title: 'On-Ecosystem Projects', url: '/ecosystem-projects', count: 5 }
					]
				},
				{
					title: 'Parachains',
					url: '/parachains',
					icon: ParachainsIcon
				},
				{
					title: 'Archived',
					url: '/archived',
					icon: ArchivedIcon
				}
			]
		}
	];

	const headerData = [
		{ src: Head1, alt: 'Head 1', bgColor: 'bg-sidebar_head1', tooltip: 'Tooltip 1' },
		{ src: Head2, alt: 'Head 2', bgColor: 'bg-sidebar_head2', tooltip: 'Tooltip 2' },
		{ src: Head3, alt: 'Head 3', bgColor: 'bg-sidebar_head3', tooltip: 'Tooltip 3' },
		{ src: Head4, alt: 'Head 4', bgColor: 'bg-sidebar_head4', tooltip: 'Tooltip 4' }
	];

	const bgColor = 'bg-sidebar_footer';
	const footerData = [
		{ src: Foot1, alt: 'Foot 1', bgColor, tooltip: 'Tooltip 1' },
		{ src: Foot2, alt: 'Foot 2', bgColor, tooltip: 'Tooltip 2' },
		{ src: Foot3, alt: 'Foot 3', bgColor, tooltip: 'Tooltip 3' },
		{ src: Foot4, alt: 'Foot 4', bgColor, tooltip: 'Tooltip 4' }
	];

	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			<SidebarHeader>
				<div className='flex items-center justify-center'>{getLogo()}</div>
			</SidebarHeader>

			<hr className='text-btn_secondary_border' />

			<div className='mt-5'>{generateGridData(headerData)}</div>

			<div className='px-5'>
				<CreateProposalDropdownButton state={state} />
			</div>
			<SidebarContent>
				<NavMain sections={data} />
			</SidebarContent>

			<SidebarFooter className='mb-3'>
				{state === 'expanded' && (
					<Link
						href='https://polkassembly.hellonext.co/'
						target='_blank'
						rel='noreferrer'
					>
						<div className={style.create_proposal_button}>
							<Image
								src={CautionIcon}
								alt=''
								width={30}
								height={30}
							/>
							<div className='flex flex-col'>
								<div className='flex gap-1'>
									<span className='text-blue-light-high dark:text-blue-dark-high text-sm font-semibold'>Report an issue</span>
									<ChevronRight className='h-5 w-5' />
								</div>
								<span className='text-blue-light-medium dark:text-blue-dark-medium text-[11px]'>Need help with something?</span>
							</div>
						</div>
					</Link>
				)}

				{generateGridData(footerData)}
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
