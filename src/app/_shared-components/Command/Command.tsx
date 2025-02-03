// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/app/_shared-components/Dialog';
import classes from './Command.module.scss';

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(classes.commandContainer, className)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

function CommandDialog({ children, ...props }: DialogProps) {
	return (
		<Dialog {...props}>
			<DialogContent className={classes.commandDialogContent}>
				<Command className={classes.commandDialog}>{children}</Command>
			</DialogContent>
		</Dialog>
	);
}

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>(
	({ className, ...props }, ref) => (
		<div
			className={classes.commandInputWrapper}
			data-cmdk-input-wrapper=''
		>
			<Search className={classes.commandSearchIcon} />
			<CommandPrimitive.Input
				ref={ref}
				className={cn(classes.commandInput, className)}
				{...props}
			/>
		</div>
	)
);

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.List
			ref={ref}
			className={cn(classes.commandList, className)}
			{...props}
		/>
	)
);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>((props, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className={classes.commandEmpty}
		{...props}
	/>
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Group
			ref={ref}
			className={cn(classes.commandGroup, className)}
			{...props}
		/>
	)
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Separator
			ref={ref}
			className={cn(classes.commandSeparator, className)}
			{...props}
		/>
	)
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Item
			ref={ref}
			className={cn(classes.commandItem, className)}
			{...props}
		/>
	)
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(classes.commandShortcut, className)}
			{...props}
		/>
	);
}
CommandShortcut.displayName = 'CommandShortcut';

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
