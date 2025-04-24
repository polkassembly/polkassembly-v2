// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }>(
	({ className, value, indicatorClassName, ...props }, ref) => (
		<ProgressPrimitive.Root
			ref={ref}
			className={cn('relative h-2 w-full overflow-hidden rounded-full', className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn('h-full w-full flex-1 bg-decision_bar_indicator transition-all', indicatorClassName)}
				style={{ transform: `translateX(-${(100 - (value || 0)).toFixed(2)}%)` }}
			/>
		</ProgressPrimitive.Root>
	)
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
