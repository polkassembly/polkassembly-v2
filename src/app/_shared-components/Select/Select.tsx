// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './Select.module.scss';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { hideChevron?: boolean }
>(({ className, children, hideChevron = false, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(styles.trigger, className)}
		{...props}
	>
		{children}
		{!hideChevron && (
			<SelectPrimitive.Icon asChild>
				<ChevronDown className='h-4 w-4 opacity-50' />
			</SelectPrimitive.Icon>
		)}
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(
	({ className, ...props }, ref) => (
		<SelectPrimitive.ScrollUpButton
			ref={ref}
			className={cn(styles.scrollButton, className)}
			{...props}
		>
			<ChevronUp className='h-4 w-4' />
		</SelectPrimitive.ScrollUpButton>
	)
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(
	({ className, ...props }, ref) => (
		<SelectPrimitive.ScrollDownButton
			ref={ref}
			className={cn(styles.scrollButton, className)}
			{...props}
		>
			<ChevronDown className='h-4 w-4' />
		</SelectPrimitive.ScrollDownButton>
	)
);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
	({ className, children, position = 'popper', ...props }, ref) => (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				ref={ref}
				className={cn(styles.content, className)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport className={cn(styles.viewport)}>{children}</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	)
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
	({ className, ...props }, ref) => (
		<SelectPrimitive.Label
			ref={ref}
			className={cn(styles.label, className)}
			{...props}
		/>
	)
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
	({ className, children, ...props }, ref) => (
		<SelectPrimitive.Item
			ref={ref}
			className={cn(styles.item, className)}
			{...props}
		>
			<SelectPrimitive.ItemText className={styles.itemText}>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	)
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(
	({ className, ...props }, ref) => (
		<SelectPrimitive.Separator
			ref={ref}
			className={cn(styles.separator, className)}
			{...props}
		/>
	)
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton };
