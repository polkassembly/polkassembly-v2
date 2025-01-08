// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { MdOutlineSignalCellularAlt } from 'react-icons/md';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { useAtom } from 'jotai';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { userPreferencesAtom } from '@/app/_atoms/user/userPreferencesAtom';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../DropdownMenu';

export default function RPCSwitchDropdown() {
	const [isLoading, setIsLoading] = useState(false);
	const network = getCurrentNetwork();
	const api = usePolkadotApiService();
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

	if (!(network in NETWORKS_DETAILS)) {
		return null;
	}

	const { rpcEndpoints } = NETWORKS_DETAILS[network];
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
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className={`cursor-pointer ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
					<div className='rounded-md border-[1px] border-border_grey p-1.5'>
						<MdOutlineSignalCellularAlt className='text-xl text-bg_pink' />
					</div>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='border-border_grey'>
				{rpcEndpoints.map((endpoint, index) => (
					<DropdownMenuItem
						key={endpoint?.url}
						className={`cursor-pointer ${currentEndpoint.name === endpoint.name ? 'bg-[#fde7f0] text-bg_pink' : ''} ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
						onClick={() => handleRpcSwitch(index)}
					>
						<span className='text-sm font-medium'>{endpoint.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
