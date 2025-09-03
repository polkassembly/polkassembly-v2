// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { X } from 'lucide-react';

interface NetworkBadgeProps {
	id: string;
	name: string;
	color: string;
	removable: boolean;
	onRemove?: (id: string) => void;
}

function NetworkBadge({ id, name, color, removable, onRemove }: NetworkBadgeProps) {
	return (
		<div className='flex items-center gap-2 rounded-full border border-border_grey px-3 py-1'>
			<div className={`h-3 w-3 rounded-full ${color}`} />
			<span className='text-sm text-text_primary'>{name}</span>
			{removable && onRemove && (
				<button
					type='button'
					onClick={() => onRemove(id)}
					className='text-text_secondary ml-1 hover:text-text_primary'
				>
					<X className='h-3 w-3' />
				</button>
			)}
		</div>
	);
}

export default NetworkBadge;
