// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/Tooltip';

interface ImageGridItem {
	src: string;
	alt: string;
	bgColor: string;
	tooltip: string;
	url?: string;
	onClick?: () => void;
}

interface DynamicImageGridProps {
	items: ImageGridItem[];
	rowSize: number;
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
	isExpanded: boolean;
}

const DynamicImageGrid: React.FC<DynamicImageGridProps> = function DynamicImageGrid({ items, rowSize, tooltipPosition = 'top', isExpanded }) {
	const handleClick = (item: ImageGridItem) => {
		if (item.onClick) {
			item.onClick();
		}
	};

	return (
		<TooltipProvider>
			<div
				className={` ${isExpanded ? 'flex flex-row' : 'flex flex-col'} items-center justify-center gap-3`}
				style={{
					gridTemplateColumns: isExpanded ? `repeat(${rowSize}, 1fr)` : undefined
				}}
			>
				{items.map((item) => (
					<div key={item.tooltip}>
						<Tooltip>
							<TooltipTrigger asChild>
								{item.url ? (
									<Link href={item.url}>
										<div className={`rounded-lg ${item.bgColor} flex h-10 w-10 cursor-pointer items-center justify-center p-2`}>
											<Image
												src={item.src}
												alt={item.alt}
												className='h-full w-full rounded-md'
												width={40}
												height={40}
											/>
										</div>
									</Link>
								) : (
									<div
										className={`rounded-lg ${item.bgColor} flex h-10 w-10 cursor-pointer items-center justify-center p-2`}
										onClick={() => handleClick(item)}
										role='button'
										tabIndex={0}
										onKeyPress={(e) => {
											if (e.key === 'Enter' || e.key === ' ') handleClick(item);
										}}
									>
										<Image
											src={item.src}
											alt={item.alt}
											className='h-full w-full rounded-md'
											width={40}
											height={40}
										/>
									</div>
								)}
							</TooltipTrigger>
							<TooltipContent
								side={isExpanded ? tooltipPosition : 'right'}
								className='rounded-md bg-[#363636] px-2 py-1 text-white shadow-lg'
							>
								<span className='text-sm'>{item.tooltip}</span>
								<div
									className={`absolute h-2 w-2 rotate-45 bg-[#363636] ${
										isExpanded
											? tooltipPosition === 'top'
												? '-bottom-1 left-1/2 -translate-x-1/2 transform'
												: tooltipPosition === 'bottom'
													? '-top-1 left-1/2 -translate-x-1/2 transform'
													: tooltipPosition === 'left'
														? '-right-1 top-1/2 -translate-y-1/2 transform'
														: '-left-1 top-1/2 -translate-y-1/2 transform'
											: '-left-1 top-1/2 -translate-y-1/2 transform' // Tooltip on the right
									}`}
								/>
							</TooltipContent>
						</Tooltip>
					</div>
				))}
			</div>
		</TooltipProvider>
	);
};

export default DynamicImageGrid;
