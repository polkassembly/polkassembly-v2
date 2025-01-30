// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { type SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { type IconName } from '../../../types/name';

export { IconName };

const SPRITE_URL = '/icons/sprite.svg';

/**
 * Renders an SVG icon using a sprite sheet.
 *
 * - Uses an absolute path to avoid issues with relative paths during navigation.
 * - Supports nested icons when children are provided.
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
	// Ensure the sprite URL is absolute and prevent caching issues
	const spriteHref = `${SPRITE_URL}?v=1#${name}`;

	// Handles nested icons
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
			role='img'
			aria-hidden='true'
			className={cn('inline h-[1em] w-[1em] self-center', className)}
		>
			<use href={spriteHref} />
		</svg>
	);
}
