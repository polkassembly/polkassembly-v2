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
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import CollapsibleItem from '../../CollapsibleItem';

export function NavMain({
	sections
}: {
	sections: {
		initalItems?: {
			title?: string;
			url: string;
			icon?: string;
			isActive?: boolean;
			count?: number;
			items?: {
				title: string;
				url: string;
				icon?: string;
				isActive?: boolean;
				count?: number;
			}[];
		}[];
		mainItems: {
			heading?: string; // title pushed here
			title: string;
			url: string;
			icon?: string;
			isActive?: boolean;
			count?: number;
			items?: {
				title: string;
				url: string;
				icon?: string;
				isActive?: boolean;
				count?: number;
				items?: {
					title: string;
					url: string;
					icon?: string;
					count?: number;
				}[];
			}[];
		}[];
		endItems?: {
			title: string;
			url: string;
			icon?: string;
			isActive?: boolean;
			count?: number;
			items?: {
				title: string;
				url: string;
				icon?: string;
				count?: number;
			}[];
		}[];
	}[];
}) {
	const { state } = useSidebar();
	const [isItemOpen, setIsItemOpen] = React.useState(false);

	return (
		<SidebarGroup>
			{sections.map((section) => (
				<div
					key={section.initalItems?.[0]?.title}
					className='section-wrapper'
				>
					{section.initalItems && (
						<div>
							<SidebarMenu>
								{section.initalItems.map((item) => (
									<Collapsible
										key={item.title}
										asChild
										defaultOpen={false}
										className='group/collapsible'
									>
										<SidebarMenuItem>
											{state === 'collapsed' ? (
												<div className='flex flex-col items-center'>
													<Popover>
														<PopoverTrigger asChild>
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
														</PopoverTrigger>
														{item.items && (
															<PopoverContent
																side='right'
																sideOffset={10}
																className='w-60 rounded-md border-none bg-white shadow-md'
															>
																<div>
																	{item.items.map((subItem) => (
																		<div key={subItem.title}>
																			<SidebarMenuSubButton asChild>
																				<a
																					href={subItem.url}
																					className='my-2 block rounded-md py-2 hover:bg-gray-100'
																				>
																					<span className='whitespace-nowrap'>{subItem.title}</span>
																					{subItem.count !== undefined && <span className='ml-auto rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>}
																				</a>
																			</SidebarMenuSubButton>
																		</div>
																	))}
																</div>
															</PopoverContent>
														)}
													</Popover>
												</div>
											) : (
												<CollapsibleItem item={{ ...item, title: item.title || '' }} />
											)}
										</SidebarMenuItem>
									</Collapsible>
								))}
							</SidebarMenu>
						</div>
					)}
					{section.mainItems && (
						<div>
							{section.mainItems.map((mainItem, index) => (
								<Collapsible
									key={mainItem.heading || `mainItem-${index}`}
									defaultOpen
									className='group/collapsible mt-4'
								>
									<CollapsibleTrigger asChild>
										<div>
											<div
												style={{
													borderTop: '2px dotted #ccc',
													paddingTop: '15px'
												}}
												className='flex items-center dark:border-[#4B4B4B]'
											>
												<span className={`text-lightBlue ${state === 'collapsed' ? '' : 'px-5'} dark:text-icon-dark-inactive text-xs font-medium uppercase`}>
													{mainItem.heading}
												</span>
												<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</div>
										</div>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenu>
											{mainItem.items &&
												mainItem.items.map((item) => {
													return (
														<Collapsible
															key={item.title}
															asChild
															defaultOpen={item.isActive}
															className='group/collapsible'
															onOpenChange={(open) => setIsItemOpen(open)}
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
																				className='h-6 w-6'
																				width={5}
																				height={5}
																			/>
																		)}
																		<span className='flex-1 whitespace-nowrap'>{item.title}</span>
																		{item.count !== undefined && <span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{item.count}</span>}
																		{item.items && <ChevronRight className={`ml-auto transition-transform duration-200 ${isItemOpen ? 'rotate-90' : ''}`} />}
																	</SidebarMenuButton>
																</CollapsibleTrigger>
																{item.items && (
																	<CollapsibleContent>
																		<SidebarMenuSub>
																			{item.items?.map((subItem) => (
																				<SidebarMenuSubItem key={subItem.title}>
																					<SidebarMenuSubButton asChild>
																						<a href={subItem.url}>
																							<span className='whitespace-nowrap'>{subItem.title}</span>
																							{subItem.count !== undefined && (
																								<span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>
																							)}
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
												})}
										</SidebarMenu>
									</CollapsibleContent>
								</Collapsible>
							))}
						</div>
					)}

					{section.endItems && (
						<div className='mt-4'>
							<div
								style={{
									borderTop: '2px dotted #ccc',
									paddingTop: '15px'
								}}
								className='flex items-center dark:border-[#4B4B4B]'
							>
								<SidebarMenu>
									{section.endItems.map((item) => (
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
																className='h-6 w-6'
																width={5}
																height={5}
															/>
														)}
														<span className='flex-1 whitespace-nowrap'>{item.title}</span>
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
																			<span className='whitespace-nowrap'>{subItem.title}</span>
																			{subItem.count !== undefined && <span className='ml-auto mr-2 rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium'>{subItem.count}</span>}
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
							</div>
						</div>
					)}
				</div>
			))}
		</SidebarGroup>
	);
}
