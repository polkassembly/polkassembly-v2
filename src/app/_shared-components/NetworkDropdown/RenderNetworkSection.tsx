// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

interface RenderNetworkSectionProps {
	title: string;
	networks: Record<string, StaticImageData>;
	searchTerm: string;
}

function RenderNetworkSection({ title, networks, searchTerm }: RenderNetworkSectionProps) {
	const filteredNetworks = Object.entries(networks).filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

	if (filteredNetworks.length === 0) return null;

	return (
		<div className='mb-4 overflow-y-auto'>
			<h3 className='bg-background_secondary px-2 py-2 text-sm font-medium text-btn_secondary_text'>{title}</h3>
			<div className='grid grid-cols-2 gap-2 px-2'>
				{filteredNetworks.map(([key, logo]) => (
					<div
						key={key}
						className='cursor-pointer rounded-md py-1 text-btn_secondary_text hover:text-text_pink'
					>
						<Link
							href={`https://${key.toLowerCase()}.polkassembly.io/`}
							className='flex items-center gap-2'
							passHref
						>
							<div className='h-6 w-6 flex-shrink-0 overflow-hidden rounded-full'>
								<Image
									src={logo}
									alt={key}
									width={24}
									height={24}
									className='object-cover'
								/>
							</div>
							<span className='text-sm'>{key}</span>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}

export default RenderNetworkSection;
