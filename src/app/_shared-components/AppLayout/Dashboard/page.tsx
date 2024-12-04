// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AppSidebar from '@/app/_shared-components/AppLayout/AppSidebar/AppSidebar';
import { SidebarInset, SidebarTrigger, useSidebar } from '@/app/_shared-components/sidebar';
import Navbar from '@/app/_shared-components/AppLayout/Navbar/Navbar';
import React from 'react';

export default function Dashboard({ children }: { children: React.ReactNode }) {
	const { state } = useSidebar();
	return (
		<div className='relative flex flex-1'>
			{/* Sidebar */}
			<AppSidebar />

			{/* Sidebar Trigger */}
			<div className={`absolute ${state === 'collapsed' ? 'left-16' : 'left-60'} top-10 z-50`}>
				<SidebarTrigger />
			</div>

			{/* Main Content Area */}
			<SidebarInset>
				{/* Navbar */}
				<Navbar />
				{/* Main Content */}
				<main className='flex flex-1 flex-col p-4'>{children}</main>
			</SidebarInset>
		</div>
	);
}
