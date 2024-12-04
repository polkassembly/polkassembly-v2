// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@/app/_shared-components/Sidebar';
import Image from 'next/image';
import polkassemblyLogo from '@assets/logos/Polkassembly-logo.png';
import { Separator } from '@ui/Separator';
import classes from './AppSidebar.module.scss';

function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className={classes.sidebar_header}>
				<Image
					src={polkassemblyLogo}
					width={110}
					alt='polkassembly logo'
				/>
			</SidebarHeader>
			<Separator className={classes.separator} />
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}

export default AppSidebar;
