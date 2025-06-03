// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SidebarInset } from '@/app/_shared-components/Sidebar/Sidebar';
import Navbar from '@ui/AppLayout/Navbar/Navbar';
import React from 'react';
import CustomSidebarTrigger from './AppSidebar/CustomSidebarTrigger';
import Footer from './Footer/Footer';
import AppSidebar from './AppSidebar/AppSidebar';
import SuccessModal from '../SuccessModal/SuccessModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='relative flex flex-1'>
			<AppSidebar />

			<CustomSidebarTrigger />

			<SuccessModal />

			<SidebarInset>
				<Navbar />
				<main className='flex flex-1 flex-col bg-page_background'>{children}</main>
				<Footer />
			</SidebarInset>
		</main>
	);
}
