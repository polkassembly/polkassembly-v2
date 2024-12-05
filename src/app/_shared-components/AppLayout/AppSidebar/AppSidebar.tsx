// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import React from 'react';
import { useTheme } from 'next-themes';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '../../sidebar';
import PaLogo from '../PaLogo';
import PaLogoDark from '../../../../_assets/logos/PALogoDark.svg';
import Head1 from '../../../../_assets/sidebar/head1.svg';
import Head2 from '../../../../_assets/sidebar/head2.svg';
import Head3 from '../../../../_assets/sidebar/head3.svg';
import Head4 from '../../../../_assets/sidebar/head4.svg';
import Foot1 from '../../../../_assets/sidebar/foot1.svg';
import Foot2 from '../../../../_assets/sidebar/foot2.svg';
import Foot3 from '../../../../_assets/sidebar/foot3.svg';
import Foot4 from '../../../../_assets/sidebar/foot4.svg';
import Home from '../../../../_assets/sidebar/homeicon-selected.svg';

import DynamicImageGrid from '../DynamicImageGrid';
import { NavMain } from '../NavItems/NavItems';

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
				{ title: 'Home', url: '/home', icon: Home, isActive: true, count: 5 },
				{ title: 'Discussions', url: '/discussions', icon: Head4 },
				{ title: 'Preimages', url: '/preimages', icon: Head4, count: 2 },
				{ title: 'Delegation', url: '/delegation', icon: Head4 },
				{
					title: 'Bounty',
					url: '/bounty',
					icon: Head4,
					items: [
						{ title: 'Bounty Dashboard', url: '/bounty/dashboard', count: 8 },
						{ title: 'On-chain Bounties', url: '/bounty/onchain' }
					]
				}
			],
			mainItems: [
				{
					heading: 'Tracks',
					title: 'Home',
					url: '/home',
					icon: Head4,
					isActive: true,
					count: 5,
					items: [{ title: 'Overview', url: '/home/overview', icon: Head4, count: 2 }]
				},
				{
					heading: 'Origins',
					title: 'Discussions',
					url: '/discussions',
					icon: Head4,
					items: [
						{
							title: 'Topics',
							url: '/discussions/topics',
							icon: Head4,
							items: [
								{
									title: 'Trending',
									url: '/discussions/topics/trending',
									icon: Head4,
									count: 1
								}
							]
						}
					]
				}
			],
			endItems: [
				{
					title: 'Gov Analytics',
					url: '/gov-analytics',
					icon: Head4
				},
				{
					title: 'Calendar',
					url: '/calendar',
					icon: Head4
				},
				{
					title: 'Community',
					url: '/community',
					icon: Head4,
					items: [
						{ title: 'Members', url: '/Members' },
						{ title: 'On-Ecosystem Projects', url: '/ecosystem-projects', count: 5 }
					]
				},
				{
					title: 'Parachains',
					url: '/parachains',
					icon: Head4
				},
				{
					title: 'Archived',
					url: '/archived',
					icon: Head4
				}
			]
		}
	];

	const headerData = [
		{ src: Head1, alt: 'Head 1', bgColor: 'bg-[#F3F9D7]', tooltip: 'Tooltip 1' },
		{ src: Head2, alt: 'Head 2', bgColor: 'bg-[#fdf8e1]', tooltip: 'Tooltip 2' },
		{ src: Head3, alt: 'Head 3', bgColor: 'bg-[#ffede5]', tooltip: 'Tooltip 3' },
		{ src: Head4, alt: 'Head 4', bgColor: 'bg-[#dff4ff]', tooltip: 'Tooltip 4' }
	];

	const bgColor = 'bg-[#F3F4F6]';
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

			<hr className='text-[#D2D8E0]' />

			<div className='mt-5'>{generateGridData(headerData)}</div>

			<SidebarContent>
				<NavMain sections={data} />
			</SidebarContent>

			<SidebarFooter className='mb-3'>{generateGridData(footerData)}</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
