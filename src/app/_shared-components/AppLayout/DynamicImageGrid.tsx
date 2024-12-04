// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

interface ImageGridItem {
	src: string;
	alt: string;
	bgColor: string;
	tooltip: string;
}

interface DynamicImageGridProps {
	items: ImageGridItem[];
	rowSize: number;
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
	isExpanded: boolean;
}

const DynamicImageGrid: React.FC<DynamicImageGridProps> = function DynamicImageGrid({ items, rowSize, tooltipPosition = 'top', isExpanded }) {
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
								<div className={`rounded-lg ${item.bgColor} flex h-10 w-10 cursor-pointer items-center justify-center p-2`}>
									<Image
										src={item.src}
										alt={item.alt}
										className='h-full w-full rounded-md'
										width={40}
										height={40}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent side={tooltipPosition}>
								<span className='text-sm'>{item.tooltip}</span>
							</TooltipContent>
						</Tooltip>
					</div>
				))}
			</div>
		</TooltipProvider>
	);
};

export default DynamicImageGrid;
