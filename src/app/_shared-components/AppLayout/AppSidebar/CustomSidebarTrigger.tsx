// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import dynamic from 'next/dynamic';
import { useSidebar } from '../../Sidebar/Sidebar';

const SidebarTrigger = dynamic(() => import('../../Sidebar/Sidebar').then((mod) => mod.SidebarTrigger), { ssr: false });

function CustomSidebarTrigger() {
	const { state } = useSidebar();
	return (
		<div className={cn('fixed left-4 top-4 z-50 transition-all duration-200 ease-in-out md:top-12', state === 'collapsed' ? 'md:left-16' : 'md:left-[13.5rem]')}>
			<SidebarTrigger />
		</div>
	);
}

export default CustomSidebarTrigger;
