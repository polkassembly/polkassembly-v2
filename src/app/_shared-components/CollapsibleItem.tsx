// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from './Sidebar';

interface Item {
	title?: string;
	url?: string;
	icon?: string;
	isActive?: boolean;
	isNew?: boolean;
	count?: number;
	items?: Item[];
}

type State = 'collapsed' | 'expanded';

function CollapsibleItem({ item, state }: { item: Item; state: State }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<SidebarMenuItem>
			<ul>
				{state === 'collapsed' ? (
					<div className='relative flex flex-col items-center'>
						<Popover>
							<PopoverTrigger asChild>
								<div className='relative py-0.5'>
									{item.isNew && <span className='absolute right-[-12px] top-[1px] rounded-full bg-blue-500 px-1.5 text-[10px] text-white'>New</span>}
									<SidebarMenuButton
										size='lg'
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
									</SidebarMenuButton>
								</div>
							</PopoverTrigger>
							{item.items && (
								<PopoverContent
									side='right'
									sideOffset={10}
									className='w-64 rounded-xl border-[1px] border-solid border-[#000000] border-opacity-[10%] bg-white p-1.5 py-2.5 shadow-md'
								>
									<ul className='space-y-2'>
										{item.items.map((subItem) => (
											<li
												key={item.title}
												className='flex cursor-pointer items-center gap-2 rounded-md px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800'
											>
												<SidebarMenuSubButton asChild>
													<a
														href={subItem.url}
														className='block rounded-md hover:bg-gray-100'
													>
														<span className='whitespace-nowrap'>{subItem.title}</span>
														{subItem.count !== undefined && <span className='ml-auto rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>}
													</a>
												</SidebarMenuSubButton>
											</li>
										))}
									</ul>
								</PopoverContent>
							)}
						</Popover>
					</div>
				) : (
					<Collapsible
						asChild
						open={isOpen}
						onOpenChange={setIsOpen}
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
									<span className='flex-1 whitespace-nowrap'>
										{item.title}
										{item.isNew && <span className='ml-2 rounded-full bg-blue-500 px-1.5 text-xs text-white'>New</span>}
									</span>
									{item.count !== undefined && <span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{item.count}</span>}
									{item.items && <ChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />}
								</SidebarMenuButton>
							</CollapsibleTrigger>
							{item.items && (
								<CollapsibleContent>
									<SidebarMenuSub>
										<ul>
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
										</ul>
									</SidebarMenuSub>
								</CollapsibleContent>
							)}
						</SidebarMenuItem>
					</Collapsible>
				)}
			</ul>
		</SidebarMenuItem>
	);
}

export default CollapsibleItem;
