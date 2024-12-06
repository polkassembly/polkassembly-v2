// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/Tooltip';
import style from './DynamicImageGrid.module.scss';

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
				className={`${isExpanded ? style.flexRow : style.flexCol}`}
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
										<div className={`${style.iconWrapper} ${item.bgColor}`}>
											<Image
												src={item.src}
												alt={item.alt}
												className={style.image}
												width={40}
												height={40}
											/>
										</div>
									</Link>
								) : (
									<div
										className={`${style.iconWrapper} ${item.bgColor}`}
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
											className={style.image}
											width={40}
											height={40}
										/>
									</div>
								)}
							</TooltipTrigger>
							<TooltipContent
								side={isExpanded ? tooltipPosition : 'right'}
								className={style.tooltipContent}
							>
								<span className={style.tooltipText}>{item.tooltip}</span>
								<div
									className={`${style.tooltipArrow} ${
										isExpanded
											? tooltipPosition === 'top'
												? style.arrowTop
												: tooltipPosition === 'bottom'
													? style.arrowBottom
													: tooltipPosition === 'left'
														? style.arrowLeft
														: style.arrowRight
											: style.arrowRight
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
