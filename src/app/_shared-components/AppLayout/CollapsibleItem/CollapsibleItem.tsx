// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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

const SELECTED_ICON_CLASS = style.sidebar_selected_icon;
const NEW_BADGE_TEXT = 'Sidebar.Tag.new';
const DARK_ICON_CLASS = style.darkIcon;

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
													className={DARK_ICON_CLASS}
												/>
											</div>
										)}
										<span className='text-sidebar_title'>{subItem.title}</span>
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
													className={`${subItem.isActive ? SELECTED_ICON_CLASS : DARK_ICON_CLASS}`}
													width={20}
													height={20}
												/>
											</div>
										)}
										<span className='whitespace-nowrap text-sidebar_title'>{subItem.title}</span>
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

function CollapsedState({ item }: { item: ISidebarMenuItem }) {
	const t = useTranslations();
	return (
		<SidebarMenuItem>
			<div className={style.sidebarTrigger}>
				<Popover>
					<PopoverTrigger asChild>
						<div className={style.triggerWrapper}>
							{item.isNew && <span className={style.newBadge}>{t(NEW_BADGE_TEXT)}</span>}
							<SidebarMenuButton
								size='lg'
								tooltip={item.title}
								className={`${style.sidebarButtonCollapse} ${item.isActive || item.items?.some((subItem) => subItem.isActive) ? style.sidebarActive : ''}`}
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
											className={`${item.isActive || item.items?.some((subItem) => subItem.isActive) ? SELECTED_ICON_CLASS : DARK_ICON_CLASS}`}
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
															className={DARK_ICON_CLASS}
															width={24}
															height={24}
														/>
													</div>
												)}
												<span className='text-sidebar_title'>{subItem.title}</span>
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

function CollapsibleButton({ item, isOpen, onClick }: { item: ISidebarMenuItem; isOpen: boolean; onClick?: () => void }) {
	const t = useTranslations();
	return (
		<SidebarMenuButton
			size='default'
			tooltip={item.title}
			className={`${style.mainButton} ${item.isActive || item.items?.some((subItem) => subItem.isActive) ? style.sidebarActive : ''}`}
			onClick={onClick}
		>
			{item.icon && (
				<div className={style.iconWrapper}>
					<Image
						src={item.icon}
						alt={item.title || 'icon'}
						className={`${item.isActive || item.items?.some((subItem) => subItem.isActive) ? SELECTED_ICON_CLASS : DARK_ICON_CLASS}`}
						width={24}
						height={24}
					/>
				</div>
			)}
			<span className={style.mainTitle}>
				<span className={`${item.isActive || item.items?.some((subItem) => subItem.isActive) ? 'text-sidebar_menu_active_text' : 'text-sidebar_title'}`}>{item.title}</span>
				{item.isNew && <span className={style.newBadge_expanded}>{t(NEW_BADGE_TEXT)}</span>}
			</span>
			{item.items && (
				<ChevronRight
					className={`${style.chevron} ${isOpen ? style.chevronRotate : ''} ${item.isActive || item.items?.some((subItem) => subItem.isActive) ? style.chevron_active : ''}`}
				/>
			)}
		</SidebarMenuButton>
	);
}

function ExpandedState({ item, isOpen, setIsOpen }: { item: ISidebarMenuItem; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
	const handleClick = () => {
		if (item.items) {
			setIsOpen(!isOpen);
		}
	};

	return (
		<SidebarMenuItem>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className={style.mainCollapsible}
			>
				<CollapsibleTrigger asChild>
					{item.items ? (
						<CollapsibleButton
							item={item}
							isOpen={isOpen}
							onClick={handleClick}
						/>
					) : (
						<Link href={item.url || '#'}>
							<CollapsibleButton
								item={item}
								isOpen={isOpen}
							/>
						</Link>
					)}
				</CollapsibleTrigger>

				{item.items && (
					<CollapsibleContent>
						<SidebarMenuSub>
							<ul className={style.mainList}>
								{item.items.map((subItem: ISidebarMenuItem) => (
									<SidebarMenuSubItem key={subItem.title}>
										{subItem.items ? (
											<NestedCollapsible item={subItem} />
										) : (
											<Link
												href={subItem.url || '#'}
												className={`${style.menuItem} ${subItem.isActive ? style.sidebarActive : 'text-sidebar_title'}`}
											>
												<div className='flex items-center'>
													{subItem.title}
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

function CollapsibleItem({ item, state }: { item: ISidebarMenuItem; state: State }) {
	const [isOpen, setIsOpen] = useState(false);

	return state === 'collapsed' ? (
		<CollapsedState item={item} />
	) : (
		<ExpandedState
			item={item}
			isOpen={isOpen}
			setIsOpen={setIsOpen}
		/>
	);
}

export default CollapsibleItem;
