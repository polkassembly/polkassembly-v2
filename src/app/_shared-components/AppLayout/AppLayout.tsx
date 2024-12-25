// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { SidebarInset } from '@/app/_shared-components/Sidebar/Sidebar';
import Navbar from '@ui/AppLayout/Navbar/Navbar';
import dynamic from 'next/dynamic';
import React from 'react';
import CustomSidebarTrigger from './AppSidebar/CustomSidebarTrigger';

const AppSidebar = dynamic(() => import('./AppSidebar/AppSidebar'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='relative flex flex-1'>
			<AppSidebar />

			<CustomSidebarTrigger />

			<SidebarInset>
				<Navbar />
				<main className='flex flex-1 flex-col'>{children}</main>
			</SidebarInset>
		</main>
	);
}
