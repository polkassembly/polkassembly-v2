import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
	variants: {
		show: {
			true: 'flex',
			false: 'hidden'
		}
	},
	defaultVariants: {
		show: true
	}
});

const loaderVariants = cva('animate-spin text-primary', {
	variants: {
		size: {
			small: 'size-6',
			medium: 'size-8',
			large: 'size-12'
		}
	},
	defaultVariants: {
		size: 'medium'
	}
});

interface SpinnerContentProps extends VariantProps<typeof spinnerVariants>, VariantProps<typeof loaderVariants> {
	className?: string;
	children?: React.ReactNode;
	message?: string;
}

export function LoadingSpinner({ size, show, children, className, message }: SpinnerContentProps) {
	return (
		<span className={spinnerVariants({ show })}>
			<Loader2 className={cn(loaderVariants({ size }), className)} />
			{message && <span className='mt-2 text-xs text-gray-500'>{message}</span>}
			{children}
		</span>
	);
}
