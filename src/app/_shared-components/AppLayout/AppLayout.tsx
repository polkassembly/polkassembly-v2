// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SidebarInset } from '@/app/_shared-components/Sidebar/Sidebar';
import Navbar from '@ui/AppLayout/Navbar/Navbar';
import React from 'react';
import { headers } from 'next/headers';
import CustomSidebarTrigger from './AppSidebar/CustomSidebarTrigger';
import Footer from './Footer/Footer';
import AppSidebar from './AppSidebar/AppSidebar';
import SuccessModal from '../SuccessModal/SuccessModal';
import ChatPopup from '../Klara/ChatPopup';
import NewsBannerWrapper from '../NewsBanner/NewsBannerWrapper';
import { CollapseSidebarOnRoutes } from './CollapseSidebarOnRoutes';

// Routes that render without any of the Polkassembly chrome (sidebar, navbar,
// archive banner, footer, klara chat). The page below provides its own header.
const BARE_ROUTES = ['/ecosystem-dashboard'];

const isBareRoute = (pathname: string): boolean => BARE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const headersList = await headers();
	const pathname = headersList.get('x-pathname') || '';

	if (isBareRoute(pathname)) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{children}</>;
	}

	return (
		<main className='relative flex flex-1'>
			<CollapseSidebarOnRoutes />
			<AppSidebar />

			<CustomSidebarTrigger />

			<SuccessModal />

			<ChatPopup />

			<SidebarInset>
				<Navbar />
				<main className='flex flex-1 flex-col bg-page_background'>{children}</main>
				<Footer />
			</SidebarInset>

			<NewsBannerWrapper />
		</main>
	);
}
