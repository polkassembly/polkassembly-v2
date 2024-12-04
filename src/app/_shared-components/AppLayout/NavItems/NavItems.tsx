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
	sections
}: {
	sections: {
		initalItems?: {
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
		title?: string;
		items: {
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

	return (
		<SidebarGroup>
			{sections.map((section) => (
				<div
					key={section.title}
					className='section-wrapper'
				>
					{section.initalItems && (
						<div>
							<SidebarMenu>
								{section.initalItems.map((item) => (
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
					)}
					{section.title && (
						<Collapsible
							defaultOpen
							className='group/collapsible'
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
										<span className='text-lightBlue dark:text-icon-dark-inactive px-5 text-xs font-medium uppercase'>{section.title}</span>
										<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
									</div>
								</div>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenu>
									{section.items.map((item) => (
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
							</CollapsibleContent>
						</Collapsible>
					)}

					{/* End Items with Dotted Lines */}
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
