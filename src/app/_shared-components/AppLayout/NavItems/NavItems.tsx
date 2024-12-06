// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
import { SidebarGroup, SidebarMenu, useSidebar } from '@ui/Sidebar';
import React from 'react';
import CollapsibleItem from '../CollapsibleItem/CollapsibleItem';

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
			isNew?: boolean;
			items?: {
				title: string;
				url: string;
				isNew?: boolean;
				icon?: string;
				isActive?: boolean;
				count?: number;
			}[];
		}[];
		mainItems: {
			heading?: string;
			title: string;
			url: string;
			icon?: string;
			isNew?: boolean;
			isActive?: boolean;
			count?: number;
			items?: {
				title: string;
				url: string;
				isNew?: boolean;
				icon?: string;
				isActive?: boolean;
				count?: number;
				items?: {
					title: string;
					url: string;
					isNew?: boolean;
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
			isNew?: boolean;
			count?: number;
			items?: {
				title: string;
				url: string;
				isNew?: boolean;
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
					key={section.initalItems?.[0]?.title}
					className='section-wrapper'
				>
					{section.initalItems && (
						<div>
							<SidebarMenu>
								{section.initalItems.map((item) => (
									<CollapsibleItem
										key={item.title}
										item={item}
										state={state}
									/>
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
												<span className={`text-lightBlue ${state === 'collapsed' ? '' : 'pl-4'} dark:text-icon-dark-inactive text-xs font-medium uppercase`}>
													{mainItem.heading}
												</span>
												<ChevronRight className='ml-auto mr-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</div>
										</div>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenu>
											{mainItem.items &&
												mainItem.items.map((item) => (
													<CollapsibleItem
														key={item.title}
														item={item}
														state={state}
													/>
												))}
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
										<CollapsibleItem
											key={item.title}
											item={item}
											state={state}
										/>
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
