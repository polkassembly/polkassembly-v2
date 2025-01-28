// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
	({ className, ...props }, ref) => {
		return (
			<RadioGroupPrimitive.Root
				className={cn('grid gap-2', className)}
				{...props}
				ref={ref}
			/>
		);
	}
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(
	({ className, ...props }, ref) => {
		return (
			<RadioGroupPrimitive.Item
				ref={ref}
				className={cn(
					'aspect-square h-4 w-4 rounded-full border border-btn_primary_background text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				{...props}
			>
				<RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
					<Circle className='h-3.5 w-3.5 fill-btn_primary_background stroke-none' />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
		);
	}
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
