// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PaLogo from '@ui/AppLayout/PaLogo';
import { ETheme } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { getSidebarData } from '@/_shared/_constants/sidebarConstant';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import DynamicImageGrid from '../DynamicImageGrid/DynamicImageGrid';
import { NavMain } from '../NavItems/NavItems';
import CreateProposalDropdownButton from '../CreateProposalDropdownButton/CreateProposalDropdownButton';
import styles from './AppSidebar.module.scss';
import { Icon, IconName } from '../../Icon';

function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const t = useTranslations();
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
				<Icon
					name='logos/PALogoDark'
					className='h-10 w-10'
				/>
			);
		}
		return <PaLogo variant='compact' />;
	};

	const generateGridData = (data: { src: IconName; alt: string; bgColor: string; tooltip: string }[]) => (
		<DynamicImageGrid
			items={data}
			rowSize={2}
			tooltipPosition='top'
			isExpanded={state === 'expanded'}
		/>
	);
	const data = getSidebarData(network, pathname, t);

	const headerData: { src: IconName; alt: string; bgColor: string; tooltip: string }[] = [
		{ src: 'sidebar/head1', alt: 'Head 1', bgColor: 'bg-sidebar_head1', tooltip: t('Sidebar.onChainIdentity') },
		{ src: 'sidebar/head2', alt: 'Head 2', bgColor: 'bg-sidebar_head2', tooltip: t('Sidebar.leaderboard') },
		{ src: 'sidebar/head3', alt: 'Head 3', bgColor: 'bg-sidebar_head3', tooltip: t('Sidebar.delegation') },
		{ src: 'sidebar/head4', alt: 'Head 4', bgColor: 'bg-sidebar_head4', tooltip: t('Sidebar.profile') }
	];

	const bgColor = 'bg-sidebar_footer';
	const footerData: { src: IconName; alt: string; bgColor: string; tooltip: string; url: string }[] = [
		{ src: 'sidebar/foot1', alt: 'Foot 1', bgColor, tooltip: 'TownHall', url: 'https://townhallgov.com/' },
		{ src: 'sidebar/foot2', alt: 'Foot 2', bgColor, tooltip: 'Polkasafe', url: 'https://polkasafe.xyz/' },
		{ src: 'sidebar/foot3', alt: 'Foot 3', bgColor, tooltip: 'Fellowship', url: 'https://collectives.polkassembly.io/' },
		{ src: 'sidebar/foot4', alt: 'Foot 4', bgColor, tooltip: 'Staking', url: 'https://staking.polkadot.cloud/#/overview' }
	];

	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			<SidebarHeader>
				<div className={styles.sidebar_logo}>{getLogo()}</div>
			</SidebarHeader>

			<hr className='text-border_grey' />

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
						<div className={styles.create_proposal_button}>
							<Icon
								name='sidebar/caution-icon'
								className='h-10 w-10'
							/>
							<div className='flex flex-col'>
								<span className='text-blue-light-high dark:text-blue-dark-high text-sm font-semibold'>{t('Sidebar.ReportAnIssue')}</span>
								<span className='text-blue-light-medium dark:text-blue-dark-medium text-[11px]'>{t('Sidebar.NeedHelp')}</span>
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
