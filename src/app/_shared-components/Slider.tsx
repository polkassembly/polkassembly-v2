// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef, useState } from 'react';

const Slider = forwardRef<ComponentRef<typeof SliderPrimitive.Root>, ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { withBottomIndicator?: boolean }>(
	({ className, withBottomIndicator = false, ...props }, ref) => {
		const [value, setValue] = useState(props.defaultValue);
		return (
			<div>
				<SliderPrimitive.Root
					ref={ref}
					className={cn('relative flex w-full touch-none select-none items-center', className)}
					{...props}
					value={value}
					onValueChange={(v) => {
						setValue(v);
						props.onValueChange?.(v);
					}}
				>
					<SliderPrimitive.Track className='relative h-1.5 w-full grow overflow-hidden rounded-full bg-border_grey'>
						<SliderPrimitive.Range className='absolute h-full bg-bg_pink' />
					</SliderPrimitive.Track>
					<SliderPrimitive.Thumb className='block h-6 w-4 rounded-lg bg-bg_pink shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50' />
				</SliderPrimitive.Root>
				{props.max && withBottomIndicator && (
					<div className='mt-2 flex items-center justify-between'>
						{Array.from({ length: props.max + 1 }, (_, index) => (
							<button
								key={index}
								className='col-span-1 text-left text-sm'
								onClick={() => {
									setValue([index]);
									props.onValueChange?.([index]);
								}}
								type='button'
							>
								{index}x
							</button>
						))}
					</div>
				)}
			</div>
		);
	}
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
