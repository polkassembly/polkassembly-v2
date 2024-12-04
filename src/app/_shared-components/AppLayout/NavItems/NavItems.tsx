// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/collapsible';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar
} from '@/app/_shared-components/sidebar';
import Image from 'next/image';

export function NavMain({
	items
}: {
	items: {
		title: string;
		url: string;
		icon?: string;
		isActive?: boolean;
		count?: number;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const { state } = useSidebar();
	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={item.isActive}
						className='group/collapsible'
					>
						<SidebarMenuItem className='flex flex-col items-center px-5 py-1'>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton
									size={state === 'collapsed' ? 'lg' : 'default'}
									tooltip={item.title}
								>
									{item.icon && (
										<Image
											src={item.icon}
											alt={item.icon}
										/>
									)}
									<span className='flex-1'>{item.title}</span>
									{item.count !== undefined && <span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{item.count}</span>}
									{item.items && <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />}
								</SidebarMenuButton>
							</CollapsibleTrigger>
							{item.items && (
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<a href={subItem.url}>
														<span>{subItem.title}</span>
													</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							)}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
