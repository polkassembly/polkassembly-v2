// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import dynamic from 'next/dynamic';
import { useSidebar } from '../../Sidebar/Sidebar';

const SidebarTrigger = dynamic(() => import('../../Sidebar/Sidebar').then((mod) => mod.SidebarTrigger), { ssr: false });

function CustomSidebarTrigger() {
	const { state } = useSidebar();
	const isMobile = useIsMobile();
	return (
		<div
			className={cn(
				'absolute top-12 z-50 transition-all duration-200 ease-in-out lg:fixed',
				!isMobile ? (state === 'collapsed' ? 'left-16' : 'left-[13.5rem]') : 'left-4 top-4',
				isMobile ? 'fixed' : ''
			)}
		>
			<SidebarTrigger />
		</div>
	);
}

export default CustomSidebarTrigger;
