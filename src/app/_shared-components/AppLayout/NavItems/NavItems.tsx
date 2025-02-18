// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
import { SidebarGroup, SidebarMenu, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import React from 'react';
import CollapsibleItem from '../CollapsibleItem/CollapsibleItem';
import styles from './NavItems.module.scss';

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
				items?: {
					title: string;
					url: string;
					isNew?: boolean;
					icon?: string;
					count?: number;
				}[];
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
											<div className='flex cursor-pointer items-center border-t-2 border-dotted border-border_grey pb-2 pt-4'>
												<span className={`text-text_primary ${state === 'collapsed' ? 'pl-2' : 'pl-4'} dark:text-icon-dark-inactive text-xs font-medium uppercase`}>
													{mainItem.heading}
												</span>
												<ChevronRight className={`${styles.chevron} group-data-[state=open]/collapsible:rotate-90`} />
											</div>
										</div>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenu>
											{mainItem.items &&
												mainItem.items.map((item) => (
													<div key={item.title}>
														<CollapsibleItem
															item={item}
															state={state}
														/>
													</div>
												))}
										</SidebarMenu>
									</CollapsibleContent>
								</Collapsible>
							))}
						</div>
					)}

					{section.endItems && (
						<div className='mt-4'>
							<div className='mt-4 flex items-center border-t-2 border-dotted border-border_grey pt-4'>
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
