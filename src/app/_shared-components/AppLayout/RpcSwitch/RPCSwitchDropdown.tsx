// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { AiFillSignal } from '@react-icons/all-files/ai/AiFillSignal';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../DropdownMenu';

export default function RPCSwitchDropdown({ className }: { className?: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { userPreferences, setUserPreferences } = useUserPreferences();

	if (!(network in NETWORKS_DETAILS)) {
		return null;
	}

	const { rpcEndpoints } = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS];
	const currentEndpoint = rpcEndpoints[userPreferences?.rpcIndex || 0];

	const handleRpcSwitch = async (index: number) => {
		if (!apiService || isLoading) return;
		setIsLoading(true);
		try {
			await apiService.switchToNewRpcEndpoint(index);
			setUserPreferences({ ...userPreferences, rpcIndex: index });
		} catch {
			// TODO: show notification
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger
					className={cn(className, 'relative flex w-full items-center gap-3 rounded-md border border-border_grey bg-network_dropdown_bg p-1.5')}
					disabled={isLoading}
					noArrow
				>
					{isLoading ? <Loader2 className='animate-spin text-xl text-bg_pink' /> : <AiFillSignal className='text-xl text-bg_pink' />}
					<span className='block text-xs font-semibold text-text_primary md:hidden'>{currentEndpoint.name}</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-96 border-border_grey sm:w-52'>
					{rpcEndpoints.map((endpoint, index) => (
						<DropdownMenuItem
							key={endpoint?.url}
							className={`cursor-pointer hover:bg-sidebar_menu_hover ${currentEndpoint.name === endpoint.name ? 'bg-sidebar_menu_bg text-bg_pink' : ''}`}
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
