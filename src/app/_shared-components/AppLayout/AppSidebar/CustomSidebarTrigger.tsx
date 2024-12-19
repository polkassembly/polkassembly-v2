// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import React from 'react';
import { SidebarTrigger, useSidebar } from '../../Sidebar/Sidebar';

function CustomSidebarTrigger() {
	const { state } = useSidebar();
	const isMobile = useIsMobile();
	return (
		<div
			className={cn(
				'',
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
	);
}

export default CustomSidebarTrigger;
