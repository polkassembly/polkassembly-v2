// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { type SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { type IconName } from '../../../types/name';

export { IconName };

// Function to determine the correct sprite file based on the icon name
const getSpritePath = (name: string) => {
	// Expecting name format like "folder/iconName"
	const [folder, icon] = name.split('/');

	// If folder isn't specified, fallback to a default sprite
	const spritePath = folder ? `/icons/${folder}.svg` : '/icons/default.svg';

	return `${spritePath}#${icon || name}`;
};

/**
 * Renders an SVG icon using a sprite sheet.
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
	const spriteHref = getSpritePath(name);

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
