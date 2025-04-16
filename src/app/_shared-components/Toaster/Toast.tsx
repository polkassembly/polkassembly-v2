// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ComponentPropsWithoutRef, ElementRef, forwardRef, ReactElement } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENotificationStatus } from '@/_shared/types';
import styles from './Toaster.module.scss';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = forwardRef<ElementRef<typeof ToastPrimitives.Viewport>, ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(styles.toast_viewport, className)}
		{...props}
	/>
));
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
				[ENotificationStatus.SUCCESS]: 'bg-green-500 text-white',
				[ENotificationStatus.WARNING]: 'bg-toast_warning_bg text-btn_secondary_text',
				[ENotificationStatus.INFO]: 'bg-toast_info_bg border border-toast_info_border text-btn_secondary_text',
				[ENotificationStatus.ERROR]: 'bg-toast_error_bg text-btn_secondary_text'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);
const Toast = forwardRef<
	ElementRef<typeof ToastPrimitives.Root>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants> & { status?: ENotificationStatus }
>(({ className, variant, status, ...props }, ref) => {
	const finalVariant = status || variant;
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant: finalVariant }), className)}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = forwardRef<ElementRef<typeof ToastPrimitives.Action>, ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(styles.toast_action, className)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = forwardRef<ElementRef<typeof ToastPrimitives.Close>, ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(styles.toast_close, className)}
		{...props}
	>
		<X className='h-5 w-5 text-opacity-[70%]' />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = forwardRef<ElementRef<typeof ToastPrimitives.Title>, ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn(styles.toast_title, className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = forwardRef<ElementRef<typeof ToastPrimitives.Description>, ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Description
			ref={ref}
			className={cn(styles.toast_description, className)}
			{...props}
		/>
	)
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = ReactElement<typeof ToastAction>;

export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
