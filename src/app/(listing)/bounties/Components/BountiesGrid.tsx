// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPostListing } from '@/_shared/types';
import BountyCard from './BountyCard';

interface Props {
	items: IPostListing[];
}

function BountiesGrid({ items }: Props) {
	if (!items?.length) return null;

	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{items.map((item) => (
				<BountyCard
					key={item.index}
					item={item}
				/>
			))}
		</div>
	);
}

export default BountiesGrid;
