// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import classes from './RadioGroup.module.scss';

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
	({ className, ...props }, ref) => {
		return (
			<RadioGroupPrimitive.Root
				className={cn(classes.radioGroup, className)}
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
				className={cn(classes.radioGroupItem, className)}
				{...props}
			>
				<RadioGroupPrimitive.Indicator className={classes.radioGroupIndicator}>
					<Circle className={classes.radioGroupIndicatorCircle} />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
		);
	}
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
