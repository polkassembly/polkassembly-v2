// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative rounded-lg border px-4 py-3 text-sm', {
	variants: {
		variant: {
			default: 'bg-background text-foreground',
			destructive: 'border-failure/50 text-failure dark:border-failure [&>svg]:text-failure',
			info: 'border-info/50 text-info dark:border-info [&>svg]:text-info'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		role='alert'
		className={cn(alertVariants({ variant }), className)}
		{...props}
	/>
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
	// eslint-disable-next-line jsx-a11y/heading-has-content
	<h5
		ref={ref}
		className={cn('mb-1 font-medium leading-none tracking-tight', className)}
		{...props}
	/>
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('text-sm [&_p]:leading-relaxed', className)}
		{...props}
	/>
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
