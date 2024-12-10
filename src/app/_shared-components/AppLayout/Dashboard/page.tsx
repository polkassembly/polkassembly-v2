// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AppSidebar from '@ui/AppLayout/AppSidebar/AppSidebar';
import { SidebarInset, SidebarTrigger, useSidebar } from '@ui/Sidebar';
import Navbar from '@ui/AppLayout/Navbar/Navbar';
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Dashboard({ children }: { children: React.ReactNode }) {
	const { state } = useSidebar();
	const isMobile = useIsMobile();
	return (
		<div className='relative flex flex-1'>
			{/* Sidebar */}
			<AppSidebar />

			{/* Sidebar Trigger */}
			<div
				className={cn(
					'', // Base styles
					!isMobile
						? state === 'collapsed'
							? 'absolute left-16 top-10 z-50 transition-all duration-200 ease-in-out'
							: 'absolute left-60 top-10 z-50 transition-all duration-200 ease-in-out'
						: 'ml-4 mt-4'
				)}
			>
				{' '}
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
