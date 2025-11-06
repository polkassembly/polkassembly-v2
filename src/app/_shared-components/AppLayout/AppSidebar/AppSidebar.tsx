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
import KlaraAvatar from '@assets/klara/avatar.svg';
import { useKlara } from '@/hooks/useKlara';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { getSidebarData } from '@/_shared/_constants/sidebarConstant';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoChevronUp } from '@react-icons/all-files/io5/IoChevronUp';
import ChatsHistory from '@/app/_shared-components/Klara/ChatsHistory';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ITrackCounts, EChatState } from '@/_shared/types';
import { NavMain } from '../NavItems/NavItems';
import CreateButton from '../CreateButton/CreateButton';
import styles from './AppSidebar.module.scss';

function AppSidebar(props: ComponentProps<typeof Sidebar>) {
	const { state, setOpenMobile } = useSidebar();
	const { chatState, setChatState } = useKlara();
	const t = useTranslations();
	const pathname = usePathname();

	const network = getCurrentNetwork();

	const { data: trackCounts = {} } = useQuery<ITrackCounts>({
		queryKey: ['track-counts'],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.getTrackCounts();
			if (error) {
				throw new Error(error.message || 'Failed to fetch track counts');
			}
			return data || {};
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: true
	});

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

	const data = getSidebarData(network, pathname, t, trackCounts);

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

			<SidebarFooter className='mb-3 px-3'>
				{state === 'expanded' ? (
					chatState === EChatState.EXPANDED_SMALL ? (
						<ChatsHistory />
					) : (
						<button
							type='button'
							className={styles.chat_button}
							onClick={() => {
								setOpenMobile(false);
								setChatState(EChatState.EXPANDED_SMALL);
							}}
							aria-label='Chat with Klara'
						>
							<div className={styles.chat_button_content}>
								<Image
									src={KlaraAvatar}
									alt='Klara AI Assistant'
									width={36}
									height={36}
								/>
								<div className='flex flex-col text-left'>
									<div className='flex items-center gap-1 text-sm font-semibold text-text_primary'>
										<span>{t('Sidebar.chatWithKlara')}</span>
										<IoChevronUp className='h-4 w-4 rotate-90' />
									</div>
									<span className='text-xs text-basic_text'>{t('Sidebar.klaraDesc')}</span>
								</div>
							</div>
						</button>
					)
				) : (
					<button
						type='button'
						className={styles.chat_button}
						onClick={() => setChatState(EChatState.EXPANDED_SMALL)}
						aria-label='Chat with Klara'
					>
						<div className={`${styles.chat_button_content} justify-center`}>
							<Image
								src={KlaraAvatar}
								alt='Klara AI Assistant'
								width={36}
								height={36}
							/>
						</div>
					</button>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
