// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export const buttonVariants = {
	default: 'bg-btn_primary_background rounded-md text-btn_primary_text text-sm shadow hover:bg-btn_primary_background/90',
	destructive: 'bg-failure text-white shadow-sm hover:bg-failure/90',
	outline:
		'bg-btn_secondary_background text-btn_secondary_text rounded-lg border border-btn_secondary_border hover:border-navbar_border shadow-sm hover:bg-btn_secondary_background/80',
	secondary: 'bg-btn_secondary_background text-text_pink rounded-lg border border-navbar_border hover:border-navbar_border shadow-sm hover:bg-btn_secondary_background/80',
	ghost: '',
	pagination: 'bg-btn_secondary_background text-text_primary rounded-lg border border-pagination_border hover:border-navbar_border shadow-sm hover:bg-btn_secondary_background/80',
	link: 'text-primary underline-offset-4 hover:underline'
};

export const buttonSizes = {
	default: 'h-9 px-4 py-2',
	sm: 'h-8 rounded-md px-3 text-xs',
	lg: 'h-10 rounded-md px-8',
	icon: 'px-2 py-1',
	pagination: 'px-2 sm:px-3 h-8 w-8 py-1'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof buttonVariants;
	size?: keyof typeof buttonSizes;
	asChild?: boolean;
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	fullWidth?: boolean;
	disabledTooltip?: string;
	ariaLabel?: string;
	loadingText?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			asChild = false,
			isLoading = false,
			leftIcon,
			rightIcon,
			fullWidth = false,
			disabledTooltip = 'This action is disabled',
			ariaLabel,
			loadingText,
			onClick,
			children,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : 'button';

		return (
			<Comp
				className={cn(
					'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
					buttonVariants[variant as keyof typeof buttonVariants],
					buttonSizes[size as keyof typeof buttonSizes],
					fullWidth && 'w-full',
					isLoading && 'cursor-not-allowed opacity-70',
					className
				)}
				ref={ref}
				disabled={isLoading || props.disabled}
				aria-disabled={isLoading || props.disabled}
				aria-label={ariaLabel || children?.toString() || 'Button'}
				data-tooltip={props.disabled && disabledTooltip}
				onClick={(event) => {
					if (!isLoading && onClick) {
						onClick(event);
					}
				}}
				{...props}
			>
				{isLoading ? (
					<>
						<span className='loader h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
						{loadingText && <span>{loadingText}</span>}
					</>
				) : (
					<>
						{leftIcon && <span>{leftIcon}</span>}
						{children}
						{rightIcon && <span className='ml-2'>{rightIcon}</span>}
					</>
				)}
			</Comp>
		);
	}
);

Button.displayName = 'Button';

export { Button };
