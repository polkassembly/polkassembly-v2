import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@ui/sidebar'
import Image from 'next/image'
import polkassemblyLogo from '@assets/logos/Polkassembly-logo.png';
import { Separator } from '../../separator';
import classes from './AppSidebar.module.scss';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className={classes.sidebar_header}>
        <Image src={polkassemblyLogo} width={110} alt='polkassembly logo' />
      </SidebarHeader>
      <Separator className={classes.separator} />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar