// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import React from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { ETheme } from '@/_shared/types';
import CautionIcon from '@assets/sidebar/caution-icon.svg';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { getSidebarData } from '@/_shared/_constants/sidebarConstant';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import DynamicImageGrid from '../DynamicImageGrid/DynamicImageGrid';
import { NavMain } from '../NavItems/NavItems';
import CreateProposalDropdownButton from '../CreateProposalDropdownButton/CreateProposalDropdownButton';
import styles from './AppSidebar.module.scss';

function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const { resolvedTheme: theme } = useTheme();
	const pathname = usePathname();

	const network = getCurrentNetwork();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const getLogo = () => {
		if (theme === ETheme.LIGHT) {
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
	const data = getSidebarData(network, pathname);

	const headerData = [
		{ src: Head1, alt: 'Head 1', bgColor: 'bg-sidebar_head1', tooltip: 'On-Chain Identity' },
		{ src: Head2, alt: 'Head 2', bgColor: 'bg-sidebar_head2', tooltip: 'Leaderboard' },
		{ src: Head3, alt: 'Head 3', bgColor: 'bg-sidebar_head3', tooltip: 'Delegation' },
		{ src: Head4, alt: 'Head 4', bgColor: 'bg-sidebar_head4', tooltip: 'Profile' }
	];

	const bgColor = 'bg-sidebar_footer';
	const footerData = [
		{ src: Foot1, alt: 'Foot 1', bgColor, tooltip: 'TownHall', url: 'https://townhallgov.com/' },
		{ src: Foot2, alt: 'Foot 2', bgColor, tooltip: 'Polkasafe', url: 'https://polkasafe.xyz/' },
		{ src: Foot3, alt: 'Foot 3', bgColor, tooltip: 'Fellowship', url: 'https://collectives.polkassembly.io/' },
		{ src: Foot4, alt: 'Foot 4', bgColor, tooltip: 'Staking', url: 'https://staking.polkadot.cloud/#/overview' }
	];

	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			<SidebarHeader>
				<div className={styles.sidebar_logo}>{getLogo()}</div>
			</SidebarHeader>

			<hr className='text-btn_secondary_border' />

			<div className='mt-5'>{generateGridData(headerData)}</div>

			<div className='px-4'>
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
						<div className='mx-3 mb-2 flex cursor-pointer items-center justify-center gap-[6px] rounded-xl border border-solid border-primary_border bg-[#F8F9FC] px-[6px] py-2 dark:border-[#4B4B4B] dark:bg-[#1C1D1F]'>
							<Image
								src={CautionIcon}
								alt=''
								width={30}
								height={30}
							/>
							<div className='flex flex-col'>
								<span className='text-blue-light-high dark:text-blue-dark-high text-sm font-semibold'>Report an issue</span>
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
