// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
import { SidebarMenu } from '@/app/_shared-components/Sidebar/Sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CollapsibleItem from '../CollapsibleItem/CollapsibleItem';
import styles from './NavItems.module.scss';

interface ISidebarMenuItem {
	title?: string;
	url?: string;
	icon?: string;
	isActive?: boolean;
	isNew?: boolean;
	count?: number;
	renderAsParentItem?: boolean;
	items?: ISidebarMenuItem[];
}

interface IMainItem {
	heading?: string;
	title: string;
	url: string;
	icon?: string;
	isNew?: boolean;
	isActive?: boolean;
	count?: number;
	items?: ISidebarMenuItem[];
}

// Component to handle nested popover rendering
export function NestedItemPopover({ item }: { item: ISidebarMenuItem }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className='flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors duration-200 hover:bg-sidebar_accent'>
					{item.icon && (
						<div className='mr-2 flex h-5 w-5 items-center justify-center'>
							<Image
								src={item.icon}
								alt={item.title || 'icon'}
								width={16}
								height={16}
								className={styles.darkIcon}
							/>
						</div>
					)}
					<span className='flex-1 whitespace-nowrap text-sidebar_title'>{item.title}</span>
					<ChevronRight className='h-4 w-4 text-sidebar_title transition-transform duration-200' />
				</div>
			</PopoverTrigger>
			<PopoverContent
				side='right'
				sideOffset={5}
				className='w-56 border border-gray-300 bg-[var(--sidebar-primary-foreground)] p-3'
			>
				<ul className='space-y-1'>
					{item.items?.map((subItem: ISidebarMenuItem) => (
						<li key={subItem.title}>
							<Link
								href={subItem.url || '#'}
								className={`flex h-8 w-full cursor-pointer items-center rounded-md px-2 py-1 text-sm transition-colors duration-200 hover:bg-sidebar_accent ${subItem.isActive ? 'bg-sidebar_menu_active font-medium text-sidebar_menu_active_text' : ''}`}
							>
								{subItem.icon && (
									<div className='mr-2 flex h-4 w-4 items-center justify-center'>
										<Image
											src={subItem.icon}
											alt={subItem.title || 'icon'}
											width={14}
											height={14}
											className={styles.darkIcon}
										/>
									</div>
								)}
								<span className='flex-1 text-sidebar_title'>{subItem.title}</span>
								{subItem.count !== undefined && subItem.count !== 0 && <span className='ml-auto rounded-lg bg-gray-200 px-1.5 py-0.5 text-xs font-medium'>{subItem.count}</span>}
							</Link>
						</li>
					))}
				</ul>
			</PopoverContent>
		</Popover>
	);
}

// Component to handle main items popover content
export function MainItemsPopoverContent({ mainItem }: { mainItem: IMainItem }) {
	return (
		<>
			{/* Section title without icon - matching expanded state style */}
			<div className='mb-3 border-b-2 border-dotted border-border_grey pb-2'>
				<span className='dark:text-icon-dark-inactive text-xs font-medium uppercase text-text_primary'>{mainItem.heading}</span>
			</div>

			{/* Items list */}
			<ul className='space-y-1'>
				{mainItem.items?.map((item: ISidebarMenuItem) => (
					<li key={item.title}>
						{item.items ? (
							<NestedItemPopover item={item} />
						) : (
							<Link
								href={item.url || '#'}
								className={`flex h-8 w-full cursor-pointer items-center rounded-md px-2 py-1 text-sm transition-colors duration-200 hover:bg-sidebar_accent ${item.isActive ? 'bg-sidebar_menu_active font-medium text-sidebar_menu_active_text' : ''}`}
							>
								{item.icon && (
									<div className='mr-2 flex h-5 w-5 items-center justify-center'>
										<Image
											src={item.icon}
											alt={item.title || 'icon'}
											width={16}
											height={16}
											className={styles.darkIcon}
										/>
									</div>
								)}
								<span className='flex-1 text-sidebar_title'>{item.title}</span>
								{item.count !== undefined && item.count !== 0 && <span className='ml-auto rounded-lg bg-gray-200 px-1.5 py-0.5 text-xs font-medium'>{item.count}</span>}
							</Link>
						)}
					</li>
				))}
			</ul>
		</>
	);
}

// Component to handle collapsed state main items
export function CollapsedMainItem({ mainItem, index }: { mainItem: IMainItem; index: number }) {
	return (
		<Popover key={mainItem.heading || `mainItem-${index}`}>
			<PopoverTrigger asChild>
				<div className='mt-4'>
					<div className='flex cursor-pointer items-center justify-center border-t-2 border-dotted border-border_grey pb-2 pt-4'>
						{mainItem.icon ? (
							<div className={styles.iconWrapper}>
								<Image
									src={mainItem.icon}
									alt={mainItem.heading || 'icon'}
									width={24}
									height={24}
									className={styles.darkIcon}
								/>
							</div>
						) : (
							<span className='dark:text-icon-dark-inactive pl-2 text-xs font-medium uppercase text-text_primary'>{mainItem.heading}</span>
						)}
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent
				side='right'
				sideOffset={5}
				className='w-56 border border-gray-300 bg-[var(--sidebar-primary-foreground)] p-4'
			>
				<MainItemsPopoverContent mainItem={mainItem} />
			</PopoverContent>
		</Popover>
	);
}

// Component to handle expanded state main items
export function ExpandedMainItem({ mainItem, index, sidebarState }: { mainItem: IMainItem; index: number; sidebarState: 'expanded' | 'collapsed' }) {
	return (
		<Collapsible
			key={mainItem.heading || `mainItem-${index}`}
			defaultOpen={false}
			className='group/collapsible mt-4'
		>
			<CollapsibleTrigger asChild>
				<div>
					<div className='flex cursor-pointer items-center border-t-2 border-dotted border-border_grey pb-2 pt-4'>
						<span className='dark:text-icon-dark-inactive pl-4 text-xs font-medium uppercase text-text_primary'>{mainItem.heading}</span>
						<ChevronRight className={`${styles.chevron} group-data-[state=open]/collapsible:rotate-90`} />
					</div>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenu>
					{mainItem.items?.map((item) => (
						<CollapsibleItem
							key={item.title}
							item={item}
							state={sidebarState}
						/>
					))}
				</SidebarMenu>
			</CollapsibleContent>
		</Collapsible>
	);
}
