import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = {
	default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
	destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
	outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
	secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
	ghost: 'hover:bg-accent hover:text-accent-foreground',
	link: 'text-primary underline-offset-4 hover:underline'
};

const buttonSizes = {
	default: 'h-9 px-4 py-2',
	sm: 'h-8 rounded-md px-3 text-xs',
	lg: 'h-10 rounded-md px-8',
	icon: 'h-9 w-9'
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
					buttonVariants[variant],
					buttonSizes[size],
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
						{leftIcon && <span className='mr-2'>{leftIcon}</span>}
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
