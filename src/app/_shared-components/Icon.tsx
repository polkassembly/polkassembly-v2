// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { type SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { type IconName } from '../../../types/name';

export { IconName };

/**
 * Renders an SVG icon. The icon defaults to the size of the font. To make it
 * align vertically with neighboring text, you can pass the text as a child of
 * the icon and it will be automatically aligned.
 * Alternatively, if you're not ok with the icon being to the left of the text,
 * you need to wrap the icon and text in a common parent and set the parent to
 * display "flex" (or "inline-flex") with "items-center" and a reasonable gap.
 */
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
