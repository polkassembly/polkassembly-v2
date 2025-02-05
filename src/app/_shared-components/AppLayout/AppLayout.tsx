// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SidebarInset } from '@/app/_shared-components/Sidebar/Sidebar';
import Navbar from '@ui/AppLayout/Navbar/Navbar';
import React from 'react';
import CustomSidebarTrigger from './AppSidebar/CustomSidebarTrigger';
import Footer from './Footer/Footer';
import AppSidebar from './AppSidebar/AppSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='relative flex flex-1'>
			<AppSidebar />

			<CustomSidebarTrigger />

			<SidebarInset>
				<Navbar />
				<div className='text-semibold sticky top-[63px] z-40 flex w-full items-center justify-center bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-white'>
					Westend is in maintenance mode. Features may be unstable.
				</div>
				<main className='flex flex-1 flex-col bg-page_background'>{children}</main>
				<Footer />
			</SidebarInset>
		</main>
	);
}
