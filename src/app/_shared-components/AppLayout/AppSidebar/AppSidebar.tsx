// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PaLogoDark from '@assets/logos/PALogoDark.svg';
import PaLogo from '@ui/AppLayout/PaLogo';
import { useTranslations } from 'next-intl';
import CautionIcon from '@assets/sidebar/caution-icon.svg';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { getSidebarData } from '@/_shared/_constants/sidebarConstant';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ComponentProps } from 'react';
import { NavMain } from '../NavItems/NavItems';
import CreateButton from '../CreateButton/CreateButton';
import styles from './AppSidebar.module.scss';

function AppSidebar(props: ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();
	const t = useTranslations();
	const pathname = usePathname();

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

	const data = getSidebarData(network, pathname, t);

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
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
