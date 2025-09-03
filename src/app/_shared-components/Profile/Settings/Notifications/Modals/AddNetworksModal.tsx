// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { X, Plus } from 'lucide-react';

interface Network {
	id: string;
	name: string;
	type: 'polkadot' | 'kusama' | 'solo' | 'test';
	selected: boolean;
}

interface AddNetworksModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (selectedNetworks: Network[]) => void;
}

const networkGroups = {
	polkadotParachains: [
		{ id: 'polkadot-1', name: 'Polkadot', type: 'polkadot' as const, selected: true },
		{ id: 'acala-1', name: 'Acala', type: 'polkadot' as const, selected: false },
		{ id: 'polkadot-2', name: 'Polkadot', type: 'polkadot' as const, selected: true },
		{ id: 'acala-2', name: 'Acala', type: 'polkadot' as const, selected: false },
		{ id: 'polkadot-3', name: 'Polkadot', type: 'polkadot' as const, selected: true },
		{ id: 'acala-3', name: 'Acala', type: 'polkadot' as const, selected: false }
	],
	kusamaParachains: [
		{ id: 'kusama-1', name: 'Polkadot', type: 'kusama' as const, selected: true },
		{ id: 'kusama-acala-1', name: 'Acala', type: 'kusama' as const, selected: false },
		{ id: 'kusama-2', name: 'Polkadot', type: 'kusama' as const, selected: true },
		{ id: 'kusama-acala-2', name: 'Acala', type: 'kusama' as const, selected: false },
		{ id: 'kusama-3', name: 'Polkadot', type: 'kusama' as const, selected: true },
		{ id: 'kusama-acala-3', name: 'Acala', type: 'kusama' as const, selected: false }
	],
	soloChains: [
		{ id: 'solo-1', name: 'Polkadot', type: 'solo' as const, selected: true },
		{ id: 'solo-acala-1', name: 'Acala', type: 'solo' as const, selected: false },
		{ id: 'solo-2', name: 'Polkadot', type: 'solo' as const, selected: true },
		{ id: 'solo-acala-2', name: 'Acala', type: 'solo' as const, selected: false },
		{ id: 'solo-3', name: 'Polkadot', type: 'solo' as const, selected: true },
		{ id: 'solo-acala-3', name: 'Acala', type: 'solo' as const, selected: false }
	],
	testChains: [
		{ id: 'test-1', name: 'Polkadot', type: 'test' as const, selected: true },
		{ id: 'test-acala-1', name: 'Acala', type: 'test' as const, selected: false },
		{ id: 'test-2', name: 'Polkadot', type: 'test' as const, selected: true },
		{ id: 'test-acala-2', name: 'Acala', type: 'test' as const, selected: false },
		{ id: 'test-3', name: 'Polkadot', type: 'test' as const, selected: true },
		{ id: 'test-acala-3', name: 'Acala', type: 'test' as const, selected: false }
	]
};

function NetworkGroup({
	title,
	groupKey,
	networks: groupNetworks,
	onToggleAll,
	onToggleNetwork
}: {
	title: string;
	groupKey: keyof typeof networkGroups;
	networks: Network[];
	onToggleAll: (groupKey: keyof typeof networkGroups) => void;
	onToggleNetwork: (groupKey: keyof typeof networkGroups, networkId: string) => void;
}) {
	const allSelected = groupNetworks.every((network) => network.selected);

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<Plus className='text-text_secondary h-4 w-4' />
				<span className='text-sm font-medium text-text_primary'>{title}</span>
				<button
					type='button'
					onClick={() => onToggleAll(groupKey)}
					className='ml-auto text-xs text-text_pink hover:underline'
				>
					{allSelected ? 'Deselect All' : 'All'}
				</button>
			</div>

			<div className='grid grid-cols-3 gap-2'>
				{groupNetworks.map((network) => (
					<div
						key={network.id}
						className='flex items-center gap-2 rounded-lg border p-2'
					>
						<div className={`h-3 w-3 rounded-full ${network.name === 'Polkadot' ? 'bg-pink-500' : 'bg-gray-400'}`} />
						<span className='text-text_secondary text-xs'>{network.name}</span>
						<Checkbox
							checked={network.selected}
							onCheckedChange={() => onToggleNetwork(groupKey, network.id)}
							className='ml-auto'
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function AddNetworksModal({ open, onClose, onConfirm }: AddNetworksModalProps) {
	const [networks, setNetworks] = useState(networkGroups);

	const toggleNetwork = (groupKey: keyof typeof networkGroups, networkId: string) => {
		setNetworks((prev) => ({
			...prev,
			[groupKey]: prev[groupKey].map((network) => (network.id === networkId ? { ...network, selected: !network.selected } : network))
		}));
	};

	const toggleAll = (groupKey: keyof typeof networkGroups) => {
		const allSelected = networks[groupKey].every((network) => network.selected);
		setNetworks((prev) => ({
			...prev,
			[groupKey]: prev[groupKey].map((network) => ({ ...network, selected: !allSelected }))
		}));
	};

	const handleConfirm = () => {
		const selectedNetworks = Object.values(networks)
			.flat()
			.filter((network) => network.selected);
		onConfirm(selectedNetworks);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Plus className='text-text_secondary h-5 w-5' />
							<DialogTitle>Add Networks</DialogTitle>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='text-text_secondary hover:text-text_primary'
						>
							<X className='h-4 w-4' />
						</button>
					</div>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-text_secondary text-sm'>Please select network(s) for which you want to replicate settings:</p>

					<div className='space-y-6'>
						<NetworkGroup
							title='Polkadot and Parachains'
							groupKey='polkadotParachains'
							networks={networks.polkadotParachains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title='Kusama and Parachains'
							groupKey='kusamaParachains'
							networks={networks.kusamaParachains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title='Solo Chains'
							groupKey='soloChains'
							networks={networks.soloChains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title='Test Chains'
							groupKey='testChains'
							networks={networks.testChains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>
					</div>

					<div className='flex gap-2 pt-4'>
						<Button
							variant='outline'
							onClick={onClose}
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirm}
							className='flex-1 bg-pink-500 hover:bg-pink-600'
						>
							Confirm
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddNetworksModal;
