// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from './sidebar';

interface Item {
	title: string;
	icon?: string;
	count?: number;
	items?: { title: string; url: string; count?: number }[];
}

function CollapsibleItem({ item }: { item: Item }) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Collapsible
			asChild
			open={isOpen}
			onOpenChange={setIsOpen} // Update local state on change
			className='group/collapsible'
		>
			<SidebarMenuItem className='flex flex-col items-center px-5 py-1'>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						size='default'
						tooltip={item.title}
					>
						{item.icon && (
							<Image
								src={item.icon}
								alt={item.icon}
								className='h-6 w-6'
								width={5}
								height={5}
							/>
						)}
						<span className='flex-1 whitespace-nowrap'>{item.title}</span>
						{item.count !== undefined && <span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{item.count}</span>}
						{item.items && <ChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{item.items && (
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items.map((subItem) => (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton asChild>
										<a
											href={subItem.url}
											className='my-2 block rounded-md py-2 hover:bg-gray-100'
										>
											<span className='whitespace-nowrap'>{subItem.title}</span>
											{subItem.count !== undefined && <span className='ml-auto rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>}
										</a>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</SidebarMenuItem>
		</Collapsible>
	);
}

export default CollapsibleItem;
