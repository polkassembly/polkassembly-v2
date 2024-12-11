// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAtom } from 'jotai';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@shared/types';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { selectedRpcEndpointAtom } from '@/app/_atoms/polkadotJsApiAtom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/Dropdown';
import networkLogo from '@assets/logos/Navbar/network-icon.svg';
import { Button } from '@/app/_shared-components/Button';

function RpcSwitch({ apiService }: { apiService: PolkadotApiService }) {
	const [selectedRpcEndpoint, setSelectedRpcEndpoint] = useAtom(selectedRpcEndpointAtom);
	const [rpcEndpoints, setRpcEndpoints] = useState<{ name: string; url: string }[]>([]);

	useEffect(() => {
		const endpoints = NETWORKS_DETAILS[ENetwork.ROCOCO].rpcEndpoints;
		setRpcEndpoints(endpoints);
	}, [ENetwork.ROCOCO]);

	const handleRpcChange = async (newRpcEndpoint: string) => {
		try {
			await apiService.switchToRpcEndpoint(newRpcEndpoint);

			setSelectedRpcEndpoint(newRpcEndpoint);

			console.log('Switched to RPC endpoint:', newRpcEndpoint);
		} catch (error) {
			console.error('Failed to switch RPC endpoint:', error);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='secondary'
					size='sm'
				>
					<Image
						src={networkLogo}
						alt='network icon'
						width={16}
						height={16}
						className=''
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{rpcEndpoints.map((endpoint, index) => (
					<DropdownMenuItem
						key={index}
						onClick={() => handleRpcChange(endpoint.url)}
						className={selectedRpcEndpoint === endpoint.url ? 'bg-gray-100' : ''}
					>
						{endpoint.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default RpcSwitch;
