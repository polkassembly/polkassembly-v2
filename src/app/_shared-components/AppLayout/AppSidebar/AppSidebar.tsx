// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
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
import { useTranslations } from 'next-intl';
import CautionIcon from '@assets/sidebar/caution-icon.svg';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { getSidebarData } from '@/_shared/_constants/sidebarConstant';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
import { ComponentProps } from 'react';
import { LEADERBOARD_SUPPORTED_NETWORKS } from '@/_shared/_constants/leaderBoardSupportedNetworks';
import DynamicImageGrid from '../DynamicImageGrid/DynamicImageGrid';
import { NavMain } from '../NavItems/NavItems';
import CreateButton from '../CreateButton/CreateButton';
import styles from './AppSidebar.module.scss';

function AppSidebar(props: ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useUser();

	const network = getCurrentNetwork();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const getLogo = () => {
		return (
			<>
				<div className={state === 'expanded' ? 'dark:hidden' : ''}>
					<PaLogo variant={state === 'collapsed' ? 'compact' : 'full'} />
				</div>
				<div className={`${state === 'expanded' ? 'hidden dark:block' : 'hidden'}`}>
					<Image
						src={PaLogoDark}
						alt='Polkassembly Logo'
					/>
				</div>
			</>
		);
	};

	const generateGridData = (data: { src: string; alt: string; bgColor: string; tooltip: string }[], gridName: 'header' | 'footer') => (
		<DynamicImageGrid
			items={data}
			rowSize={2}
			tooltipPosition='top'
			isExpanded={state === 'expanded'}
			gridName={gridName}
		/>
	);
	const data = getSidebarData(network, pathname, t);

	const headerData = [
		{ src: Head1, alt: 'Head 1', bgColor: 'bg-sidebar_head1', tooltip: t('Sidebar.onChainIdentity'), url: user?.id ? '/set-identity' : '/login?nextUrl=set-identity' },
		{ src: Head3, alt: 'Head 3', bgColor: 'bg-sidebar_head3', tooltip: t('Sidebar.delegation'), url: '/delegation' },
		{ src: Head4, alt: 'Head 4', bgColor: 'bg-sidebar_head4', tooltip: t('Sidebar.profile'), url: user?.id ? `/user/${user.username}` : '/login' }
	];

	if (LEADERBOARD_SUPPORTED_NETWORKS.includes(network)) {
		headerData?.push({ src: Head2, alt: 'Head 2', bgColor: 'bg-sidebar_head2', tooltip: t('Sidebar.leaderboard'), url: '/leaderboard' });
	}

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
				<Link
					href='/'
					className={styles.sidebar_logo}
				>
					{getLogo()}
				</Link>
			</SidebarHeader>

			<hr className='text-border_grey' />

			<div className='mt-5'>{generateGridData(headerData, 'header')}</div>

			<div className='px-4'>
				<CreateButton state={state} />
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
							<Image
								src={CautionIcon}
								alt=''
								width={30}
								height={30}
							/>
							<div className='flex flex-col'>
								<span className='text-blue-light-high dark:text-blue-dark-high text-sm font-semibold'>{t('Sidebar.ReportAnIssue')}</span>
								<span className='text-blue-light-medium dark:text-blue-dark-medium text-[11px]'>{t('Sidebar.NeedHelp')}</span>
							</div>
						</div>
					</Link>
				)}

				{generateGridData(footerData, 'footer')}
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
