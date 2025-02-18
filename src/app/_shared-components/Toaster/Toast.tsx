// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationStatus } from '@/_shared/types';
import styles from './Toaster.module.scss';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Viewport
			ref={ref}
			className={cn(styles.toast_viewport, className)}
			{...props}
		/>
	)
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	cn(
		styles.toast_variants,
		'group data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full'
	),
	{
		variants: {
			variant: {
				default: 'bg-background',
				[NotificationStatus.SUCCESS]: 'bg-green-500 text-white',
				[NotificationStatus.WARNING]: 'bg-toast_warning_bg text-btn_secondary_text',
				[NotificationStatus.INFO]: 'bg-toast_info_bg border border-toast_info_border text-btn_secondary_text',
				[NotificationStatus.ERROR]: 'bg-toast_error_bg text-btn_secondary_text',
				[NotificationStatus.ERRORV2]: 'bg-toast_error_bg text-btn_secondary_text border border-toast_error_border',
				[NotificationStatus.WARNINGV2]: 'bg-toast_warning_bg text-btn_secondary_text border border-toast_warning_border'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);
const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>>(
	({ className, variant, ...props }, ref) => {
		return (
			<ToastPrimitives.Root
				ref={ref}
				className={cn(toastVariants({ variant }), className)}
				{...props}
			/>
		);
	}
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Action
			ref={ref}
			className={cn(styles.toast_action, className)}
			{...props}
		/>
	)
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Close
			ref={ref}
			className={cn(styles.toast_close, className)}
			{...props}
		>
			<X className='h-5 w-5 text-opacity-[70%]' />
		</ToastPrimitives.Close>
	)
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Title
			ref={ref}
			className={cn(styles.toast_title, className)}
			{...props}
		/>
	)
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Description
			ref={ref}
			className={cn(styles.toast_description, className)}
			{...props}
		/>
	)
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
