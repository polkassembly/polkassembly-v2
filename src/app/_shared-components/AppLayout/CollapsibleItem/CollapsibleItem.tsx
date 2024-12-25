// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '../../Sidebar/Sidebar';
import style from './CollapsibleItem.module.scss';

interface ISidebarMenuItem {
	title?: string;
	url?: string;
	icon?: string;
	isActive?: boolean;
	isNew?: boolean;
	count?: number;
	items?: ISidebarMenuItem[];
}

type State = 'collapsed' | 'expanded';

function NestedPopover({ item }: { item: ISidebarMenuItem }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className={style.nestedTrigger}>
					{item.icon && (
						<div className={style.iconWrapper}>
							<Image
								src={item.icon}
								alt={item.title || 'icon'}
								width={24}
								height={24}
							/>
						</div>
					)}
					<span className={style.itemTitle}>{item.title}</span>
					<ChevronRight className={`${style.chevron}`} />
				</div>
			</PopoverTrigger>
			<PopoverContent
				side='right'
				sideOffset={5}
				className={style.popoverContent}
			>
				<ul className={style.menuList}>
					{item.items?.map((subItem, index) => (
						<li key={subItem.url || subItem.title || index}>
							{subItem.items ? (
								<NestedPopover item={subItem} />
							) : (
								<Link
									href={subItem.url || '#'}
									className={`${style.menuItem} ${subItem.isActive ? style.sidebarActive : ''}`}
								>
									<span className='flex items-center'>
										{subItem.icon && (
											<div className={style.iconWrapper}>
												<Image
													src={subItem.icon || ''}
													alt={subItem.title || 'icon'}
													width={24}
													height={24}
												/>
											</div>
										)}
										<span>{subItem.title}</span>
									</span>
									{subItem.count !== undefined && subItem.count !== 0 && <span className={style.subItemCount}>{subItem.count}</span>}
								</Link>
							)}
						</li>
					))}
				</ul>
			</PopoverContent>
		</Popover>
	);
}

function NestedCollapsible({ item }: { item: ISidebarMenuItem }) {
	const [isNestedOpen, setIsNestedOpen] = useState(false);

	return (
		<Collapsible
			open={isNestedOpen}
			onOpenChange={setIsNestedOpen}
			className={style.nestedCollapsible}
		>
			<CollapsibleTrigger asChild>
				<SidebarMenuSubButton className={style.nestedButton}>
					<div className={style.nestedTrigger}>
						{item.icon && (
							<div className={style.iconWrapper}>
								<Image
									src={item.icon}
									alt={item.title || 'icon'}
									width={24}
									height={24}
								/>
							</div>
						)}
						<span className={style.itemTitle}>{item.title}</span>
						<ChevronRight className={`${style.chevron} ${isNestedOpen ? style.chevronRotate : ''}`} />
					</div>
				</SidebarMenuSubButton>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ul className={style.nestedList}>
					{item.items?.map((subItem) => (
						<li key={subItem.title}>
							{subItem.items ? (
								<NestedCollapsible item={subItem} />
							) : (
								<Link
									href={subItem.url || '#'}
									className={`${style.menuItem} ${subItem.isActive ? style.sidebarActive : ''}`}
								>
									<span className='flex items-center'>
										{subItem.icon && (
											<div className={style.iconWrapper}>
												<Image
													src={subItem.icon}
													alt={subItem.title || 'icon'}
													className={subItem.isActive ? style.sidebar_selected_icon : ''}
													width={20}
													height={20}
												/>
											</div>
										)}
										<span className='whitespace-nowrap'>{subItem.title}</span>
									</span>
									{subItem.count !== undefined && subItem.count !== 0 && <span className={style.subItemCount}>{subItem.count}</span>}
								</Link>
							)}
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	);
}

function CollapsibleItem({ item, state }: { item: ISidebarMenuItem; state: State }) {
	const [isOpen, setIsOpen] = useState(false);

	if (state === 'collapsed') {
		return (
			<SidebarMenuItem>
				<div className={style.sidebarTrigger}>
					<Popover>
						<PopoverTrigger asChild>
							<div className={style.triggerWrapper}>
								{item.isNew && <span className={style.newBadge}>New</span>}
								<SidebarMenuButton
									size='lg'
									tooltip={item.title}
									className={`${style.sidebarButtonCollapse} ${item.isActive ? style.sidebarActive : ''}`}
									onClick={() => {
										if (!item.items?.length) {
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
								</SidebarMenuButton>
							</div>
						</PopoverTrigger>

						{item.items && (
							<PopoverContent
								side='right'
								sideOffset={10}
								className={style.popoverContent}
							>
								<ul className={style.menuList}>
									{item.items.map((subItem) => (
										<li key={subItem.title}>
											{subItem.items ? (
												<NestedPopover item={subItem} />
											) : (
												<Link
													href={subItem.url || '#'}
													className={`${style.menuItem} ${subItem.isActive ? style.sidebarActive : ''}`}
												>
													{subItem.icon && (
														<div className={style.iconWrapper}>
															<Image
																src={subItem.icon}
																alt={subItem.title || 'icon'}
																width={24}
																height={24}
															/>
														</div>
													)}
													<span>{subItem.title}</span>
													{subItem.count !== undefined && subItem.count !== 0 && <span className={style.subItemCount}>{subItem.count}</span>}
												</Link>
											)}
										</li>
									))}
								</ul>
							</PopoverContent>
						)}
					</Popover>
				</div>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className={style.mainCollapsible}
			>
				{item.items ? (
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							size='default'
							tooltip={item.title}
							className={`${style.mainButton} ${item.isActive ? style.sidebarActive : ''}`}
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
							<span className={style.mainTitle}>
								{item.title}
								{item.isNew && <span className={style.newBadge_expanded}>New</span>}
							</span>
							{item.items && <ChevronRight className={`${style.chevron} ${isOpen ? style.chevronRotate : ''}`} />}
						</SidebarMenuButton>
					</CollapsibleTrigger>
				) : (
					<CollapsibleTrigger asChild>
						<Link href={item.url || ''}>
							<SidebarMenuButton
								size='default'
								tooltip={item.title}
								className={`${style.mainButton} ${item.isActive ? style.sidebarActive : ''}`}
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
								<span className={style.mainTitle}>
									{item.title}
									{item.isNew && <span className={style.newBadge_expanded}>New</span>}
								</span>
								{item.items && <ChevronRight className={`${style.chevron} ${isOpen ? style.chevronRotate : ''}`} />}
							</SidebarMenuButton>
						</Link>
					</CollapsibleTrigger>
				)}

				{item.items && (
					<CollapsibleContent>
						<SidebarMenuSub>
							<ul className={style.mainList}>
								{item.items.map((subItem) => (
									<SidebarMenuSubItem key={subItem.title}>
										{subItem.items ? (
											<NestedCollapsible item={subItem} />
										) : (
											<Link
												href={subItem.url || '#'}
												className={`${style.menuItem} ${subItem.isActive ? style.sidebarActive : ''}`}
											>
												<div className='flex items-center'>
													<span className='px-1'>{subItem.title}</span>
													{subItem.count !== undefined && subItem.count !== 0 && <span className={style.subItemCount}>{subItem.count}</span>}
												</div>
											</Link>
										)}
									</SidebarMenuSubItem>
								))}
							</ul>
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</Collapsible>
		</SidebarMenuItem>
	);
}

export default CollapsibleItem;
