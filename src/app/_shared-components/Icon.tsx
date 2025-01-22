// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { type SVGProps } from 'react';
import { cn } from '@/lib/utils.js';
import type { IconName } from '../../../types/name.js';

export { type IconName };

export function Icon({
	name,
	childClassName,
	className,
	children,
	...props
}: SVGProps<SVGSVGElement> & {
	name: IconName;
	childClassName?: string;
}) {
	if (children) {
		return (
			<span className={cn('font inline-flex items-center gap-1.5', childClassName)}>
				<Icon
					name={name}
					className={className}
					{...props}
				/>
				{children}
			</span>
		);
	}
	return (
		<svg
			{...props}
			className={cn('inline h-[1em] w-[1em] self-center', className)}
		>
			<use href={`./icons/sprite.svg#${name}`} />
		</svg>
	);
}
