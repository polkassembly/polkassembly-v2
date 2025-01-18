// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { MdOutlineSignalCellularAlt } from 'react-icons/md';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENetwork } from '@/_shared/types';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../DropdownMenu';

export default function RPCSwitchDropdown({ className }: { className?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const network = getCurrentNetwork();
	const api = usePolkadotApiService();
	const { userPreferences, setUserPreferences } = useUserPreferences();

	if (!(network in NETWORKS_DETAILS)) {
		return null;
	}

	const { rpcEndpoints } = NETWORKS_DETAILS[network as ENetwork];
	const currentEndpoint = rpcEndpoints[userPreferences?.rpcIndex || 0];

	const handleRpcSwitch = async (index: number) => {
		if (!api || isLoading) return;
		setIsLoading(true);
		try {
			await api.switchToNewRpcEndpoint(index);
			setUserPreferences((prev) => ({ ...prev, rpcIndex: index }));
		} catch (error) {
			console.error('Failed to switch RPC:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn(className)}>
			<DropdownMenu>
				<DropdownMenuTrigger disabled={isLoading}>
					<div className='cursor-pointer'>
						<div className='relative rounded-md border-[1px] border-border_grey p-1.5'>
							{isLoading ? <Loader2 className='animate-spin text-xl text-bg_pink' /> : <MdOutlineSignalCellularAlt className='text-xl text-bg_pink' />}
						</div>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='border-border_grey'>
					{rpcEndpoints.map((endpoint, index) => (
						<DropdownMenuItem
							key={endpoint?.url}
							className={`cursor-pointer ${currentEndpoint.name === endpoint.name ? 'bg-sidebar_menu_bg text-bg_pink' : ''}`}
							onClick={() => handleRpcSwitch(index)}
							disabled={isLoading}
						>
							<span className='text-sm font-medium'>{endpoint.name}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
