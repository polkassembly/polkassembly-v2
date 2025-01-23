// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';

const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(
	({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
		<SeparatorPrimitive.Root
			ref={ref}
			decorative={decorative}
			orientation={orientation}
			className={cn('shrink-0 bg-border_grey', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)}
			{...props}
		/>
	)
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
