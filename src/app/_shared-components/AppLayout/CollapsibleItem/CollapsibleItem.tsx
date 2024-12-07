// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '../../Sidebar';
import style from './CollapsibleItem.module.scss';

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
			<ul className='text-sidebar_text'>
				{state === 'collapsed' ? (
					<div className='relative flex flex-col items-center'>
						<Popover>
							<PopoverTrigger asChild>
								<div className={`${style.sidebarTrigger} relative`}>
									{item.isNew && <span className={style.newBadge}>New</span>}
									<SidebarMenuButton
										size='lg'
										tooltip={item.title}
										className={`${style.sidebarButtonCollapse} ${item.isActive ? style.sidebarActive : style.sidebarButtonHover}`}
										onClick={() => {
											if (!item.items || item.items.length === 0) {
												window.location.href = item.url || '#';
											}
										}}
									>
										{item.icon && (
											<div className={`${style.iconWrapper} flex items-center justify-center`}>
												<Image
													src={item.icon}
													alt={item.title || 'icon'}
													className={item.isActive ? style.sidebar_selected_icon : ''}
													width={24}
													height={24}
												/>
											</div>
										)}
									</SidebarMenuButton>
								</div>
							</PopoverTrigger>

							{item.items && (
								<PopoverContent
									side='right'
									sideOffset={10}
									className={style.popoverContent}
								>
									<ul className='space-y-2'>
										{item.items.map((subItem) => (
											<li
												key={subItem.title}
												className={`${style.sidebarButton} ${style.sidebarButtonHover}`}
											>
												<SidebarMenuSubButton asChild>
													<Link
														href={subItem.url || '#'}
														className={subItem.isActive ? style.sidebarActive : 'flex justify-between px-3 py-2'}
													>
														{subItem?.icon && (
															<div className={style.iconWrapper}>
																<Image
																	src={subItem.icon || ''}
																	alt={subItem.title || 'icon'}
																	className={subItem.isActive ? style.sidebar_selected_icon : ''}
																	width={24}
																	height={24}
																/>
															</div>
														)}
														<span className='whitespace-nowrap'>{subItem.title}</span>
														{subItem.count !== undefined && <span className='ml-auto rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>}
													</Link>
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
						<SidebarMenuItem className='flex flex-col items-center px-2'>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton
									size='default'
									tooltip={item.title}
									className={`${style.sidebarButton} ${item.isActive ? style.sidebarActive : style.sidebarButtonHover}`}
									onClick={() => {
										if (!item.items || item.items.length === 0) {
											window.location.href = item.url || '#';
										}
									}}
								>
									{item.icon && (
										<div className={style.iconWrapper}>
											<Image
												src={item.icon}
												alt={item.title || 'icon'}
												className={item.isActive ? style.sidebar_selected_icon : ''}
												width={24}
												height={24}
											/>
										</div>
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
								<CollapsibleContent className='w-full'>
									<SidebarMenuSub>
										<ul>
											{item.items.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton
														asChild
														className='flex w-full items-center justify-between'
													>
														<Link
															href={subItem.url || '#'}
															className={`${style.sidebarButton} ${subItem.isActive ? style.sidebarActive : style.sidebarButtonHover} px-1 py-1.5`}
														>
															<span className='whitespace-nowrap'>{subItem.title}</span>
															{subItem.count !== undefined && <span className={style.subItemCount}>{subItem.count}</span>}
														</Link>
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
