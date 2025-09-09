// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { cn } from '@/lib/utils';
import React from 'react';

function DVBadge({ className }: { className?: string }) {
	return <div className={cn('flex h-5 w-5 items-center justify-center rounded-full bg-bg_pink p-1 text-[10px] font-semibold text-white', className)}>DV</div>;
}

export default DVBadge;
