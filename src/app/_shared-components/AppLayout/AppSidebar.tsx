import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '../sidebar'
import Image from 'next/image'
import polkassemblyLogo from '@assets/logos/Polkassembly-logo.png';
import { Separator } from '../separator';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className='px-6 justify-center h-[60px]'>
        <Image src={polkassemblyLogo} width={110} alt='polkassembly logo' />
      </SidebarHeader>
      <Separator className='bg-border_grey' />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />s
    </Sidebar>
  )
}

export default AppSidebar