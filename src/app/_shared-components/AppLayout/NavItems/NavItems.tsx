// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { SidebarGroup, SidebarMenu, useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
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
	const { state: sidebarState } = useSidebar();

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
										state={sidebarState}
									/>
								))}
							</SidebarMenu>
						</div>
					)}

					{section.mainItems && (
						<div className='mt-4'>
							<div className='mt-4 flex items-center border-t-2 border-dotted border-border_grey pt-4'>
								<SidebarMenu className='gap-4'>
									{section.mainItems.map((item) => (
										<CollapsibleItem
											key={item.title}
											item={item}
											state={sidebarState}
										/>
									))}
								</SidebarMenu>
							</div>
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
											state={sidebarState}
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
