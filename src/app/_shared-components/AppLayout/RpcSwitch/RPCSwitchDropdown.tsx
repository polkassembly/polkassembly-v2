// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { MdOutlineSignalCellularAlt } from 'react-icons/md';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { useAtom } from 'jotai';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { userPreferencesAtom } from '@/app/_atoms/user/userPreferencesAtom';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../DropdownMenu';

export default function RPCSwitchDropdown() {
	const network = getCurrentNetwork();
	const api = usePolkadotApiService();
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

	const { rpcEndpoints } = NETWORKS_DETAILS[network];
	const currentEndpoint = rpcEndpoints[userPreferences?.rpcIndex || 0];

	if (!Object.prototype.hasOwnProperty.call(NETWORKS_DETAILS, network)) {
		return null;
	}

	const handleRpcSwitch = async (index: number) => {
		if (api) {
			await api.switchToNewRpcEndpoint(index);
			setUserPreferences((prev) => ({ ...prev, rpcIndex: index }));
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className='cursor-pointer'>
					<div className='rounded-md border-[1px] border-border_grey p-1.5'>
						<MdOutlineSignalCellularAlt className='text-xl text-bg_pink' />
					</div>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='border-border_grey'>
				{rpcEndpoints.map((endpoint, index) => (
					<DropdownMenuItem
						key={endpoint?.url}
						className={`cursor-pointer ${currentEndpoint.name === endpoint.name ? 'bg-[#fde7f0] text-bg_pink' : ''}`}
						onClick={() => handleRpcSwitch(index)}
					>
						<span className='text-sm font-medium'>{endpoint.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
