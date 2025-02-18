// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/Sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/Tooltip';
import LeftIcon from '@assets/sidebar/lefticon.svg';
import RightIcon from '@assets/sidebar/righticon.svg';
import { ComponentProps, createContext, CSSProperties, ElementRef, forwardRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './Sidebar.module.scss';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '14.4rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '5rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
const COLLAPSIBLE_ICON_HIDDEN = 'group-data-[collapsible=icon]:hidden';

type SidebarContextType = {
	state: 'expanded' | 'collapsed';
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}

	return context;
}

const SidebarProvider = forwardRef<
	HTMLDivElement,
	ComponentProps<'div'> & {
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = useState(false);

	// This is the internal state of the sidebar.
	// We use openProp and setOpenProp for control from outside the component.
	const [_open, _setOpen] = useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === 'function' ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(openState);
			} else {
				_setOpen(openState);
			}

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open]
	);

	// Helper to toggle the sidebar.
	const toggleSidebar = useCallback(() => {
		return isMobile ? setOpenMobile((mobileOpen) => !mobileOpen) : setOpen((sidebarOpen) => !sidebarOpen);
	}, [isMobile, setOpen, setOpenMobile]);

	// Adds a keyboard shortcut to toggle the sidebar.
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [toggleSidebar]);

	// We add a state so that we can do data-state="expanded" or "collapsed".
	// This makes it easier to style the sidebar with Tailwind classes.
	const state = open ? 'expanded' : 'collapsed';

	const contextValue = useMemo<SidebarContextType>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar
		}),
		[state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
	);

	return (
		<SidebarContext.Provider value={contextValue}>
			<TooltipProvider delayDuration={0}>
				<div
					style={
						{
							'--sidebar-width': SIDEBAR_WIDTH,
							'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
							...style
						} as CSSProperties
					}
					className={cn(`group/sidebar-wrapper ${styles.sidebarWrapper} has-[[data-variant=inset]]:bg-white`, className)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</SidebarContext.Provider>
	);
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = forwardRef<
	HTMLDivElement,
	ComponentProps<'div'> & {
		side?: 'left' | 'right';
		variant?: 'sidebar' | 'floating' | 'inset';
		collapsible?: 'offcanvas' | 'icon' | 'none';
		isOpen?: boolean;
		onExpand?: () => void;
		onCollapse?: () => void;
	}
>(({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', isOpen, onExpand, onCollapse, className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

	useEffect(() => {
		// Trigger the appropriate callback when state changes
		if (isOpen) {
			onExpand?.();
			if (state === 'collapsed') {
				setOpenMobile(true);
			}
		} else {
			onCollapse?.();
			if (state === 'expanded') {
				setOpenMobile(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, onExpand, onCollapse]);

	if (collapsible === 'none') {
		return (
			<div
				className={cn(`w-[--sidebar-width] ${styles.sidebarcollapsible}`, className)}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet
				open={openMobile}
				onOpenChange={setOpenMobile}
				{...props}
			>
				<SheetContent
					data-sidebar='sidebar'
					data-mobile='true'
					className={`${styles.sidebarsheetcontent} m-0 p-0 [&>button]:hidden`}
					style={
						{
							width: SIDEBAR_WIDTH_MOBILE
						} as CSSProperties
					}
					side={side}
				>
					<SheetHeader>
						<SheetTitle className='sr-only'>Mobile Sidebar</SheetTitle>
					</SheetHeader>
					<div className={styles.sidebar_mobile_children}>{children}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			ref={ref}
			className='group peer hidden text-sidebar-foreground md:block'
			data-state={state}
			data-collapsible={state === 'collapsed' ? collapsible : ''}
			data-variant={variant}
			data-side={side}
		>
			<div
				className={cn(
					'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear',
					'group-data-[collapsible=offcanvas]:w-0',
					'group-data-[side=right]:rotate-180',
					variant === 'floating' || variant === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
						: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]'
				)}
			/>
			<div
				className={cn(
					'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex',
					side === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
					variant === 'floating' || variant === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
						: 'border-r-border_grey group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
					className
				)}
				{...props}
			>
				<div
					data-sidebar='sidebar'
					className={`${styles.sidebar_children} group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow`}
				>
					{children}
				</div>
			</div>
		</div>
	);
});

Sidebar.displayName = 'Sidebar';

const SidebarTrigger = forwardRef<ElementRef<typeof Button>, ComponentProps<typeof Button>>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar, state } = useSidebar();
	const isMobile = useIsMobile();

	return (
		<Button
			ref={ref}
			data-sidebar='trigger'
			variant='link'
			className={cn('h-8 w-8 rounded-lg border border-border_grey bg-section_dark_overlay p-2', className)}
			type='button'
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<Image
				src={isMobile ? RightIcon : state === 'expanded' ? LeftIcon : RightIcon}
				alt={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
				className={cn('h-5 w-5', styles.darkIcon)}
				width={20}
				height={20}
				priority
			/>
			<span className='sr-only'>{state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}</span>
		</Button>
	);
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarInset = forwardRef<HTMLDivElement, ComponentProps<'main'>>(({ className, ...props }, ref) => {
	return (
		<main
			ref={ref}
			className={cn(
				styles.sidebar_inset,
				'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
				className
			)}
			{...props}
		/>
	);
});
SidebarInset.displayName = 'SidebarInset';

const SidebarHeader = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar='header'
			className={cn(styles.sidebar_header, className)}
			{...props}
		/>
	);
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar='footer'
			className={cn(styles.sidebar_header, className)}
			{...props}
		/>
	);
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar='content'
			className={cn(`hide_scrollbar ${styles.sidebar_content}`, className)}
			style={{ height: 'calc(100vh - 60px)' }}
			{...props}
		/>
	);
});
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar='group'
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			{...props}
		/>
	);
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarMenu = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		data-sidebar='menu'
		className={cn(styles.sidebar_menu, className)}
		{...props}
	/>
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		data-sidebar='menu-item'
		className={cn('group/menu-item relative', className)}
		{...props}
	/>
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
	cn(
		styles.menuButton,
		'transition-[width, height, padding]',
		'ring-sidebar-ring peer/menu-button focus-visible:ring-2 active:bg-white-accent active:text-sidebar-accent-foreground group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 data-[active=true]:bg-white-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-white-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2'
	),
	{
		variants: {
			variant: {
				default: cn(`${styles.default} hover:bg-white-accent`),
				outline: cn(styles.outline, 'shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]')
			},
			size: {
				default: cn(styles.defaultSize),
				sm: cn(styles.sm),
				lg: cn(styles.lg, 'group-data-[collapsible=icon]:!p-0')
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

const SidebarMenuButton = forwardRef<
	HTMLButtonElement,
	ComponentProps<'button'> & {
		asChild?: boolean;
		isActive?: boolean;
		tooltip?: string | ComponentProps<typeof TooltipContent>;
	} & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = 'default', size, tooltip, className, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	const { isMobile, state } = useSidebar();

	const button = (
		<Comp
			ref={ref}
			data-sidebar='menu-button'
			data-size={size}
			data-active={isActive}
			className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);

	if (!tooltip) {
		return button;
	}

	const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent
				side='right'
				align='center'
				className={`${styles.sidebar_menubtn} bg-tooltip_background text-white`}
				hidden={state !== 'collapsed' || isMobile}
				{...tooltipProps}
			/>
		</Tooltip>
	);
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuSub = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		data-sidebar='menu-sub'
		className={cn(styles.sidebar_menusub, COLLAPSIBLE_ICON_HIDDEN, className)}
		{...props}
	/>
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(({ ...props }, ref) => (
	<li
		ref={ref}
		{...props}
	/>
));
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = forwardRef<
	HTMLAnchorElement,
	ComponentProps<'a'> & {
		asChild?: boolean;
		size?: 'sm' | 'md';
		isActive?: boolean;
	}
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
	const Comp = asChild ? Slot : 'a';

	return (
		<Comp
			ref={ref}
			data-sidebar='menu-sub-button'
			data-size={size}
			data-active={isActive}
			className={cn(
				'data-[active=true]:bg-white-accent data-[active=true]:text-sidebar-accent-foreground',
				size === 'sm' && 'text-sm',
				size === 'md' && 'text-sm',
				COLLAPSIBLE_ICON_HIDDEN,
				className
			)}
			{...props}
		/>
	);
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar
};
