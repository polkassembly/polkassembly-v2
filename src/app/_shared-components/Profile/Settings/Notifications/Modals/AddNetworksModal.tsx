// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Switch } from '@/app/_shared-components/Switch';
import { Plus } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import MoonbeamLogo from '@assets/parachain-logos/moonbeam-logo.png';
import MoonriverLogo from '@assets/parachain-logos/moonriver-logo.png';
import CollectivesLogo from '@assets/parachain-logos/collectives-logo.png';
import PendulumLogo from '@assets/parachain-logos/pendulum-logo.jpg';
import CereLogo from '@assets/parachain-logos/cere-logo.jpg';
import PolkadexLogo from '@assets/parachain-logos/polkadex-logo.jpg';
import PolymeshLogo from '@assets/parachain-logos/polymesh-logo.png';
import MoonbaseLogo from '@assets/parachain-logos/moonbase-logo.png';
import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import PaseoLogo from '@assets/parachain-logos/paseo-logo.png';
import Parachainlogo from '@assets/icons/notification-settings/parachain-dark.svg';

interface Network {
	id: string;
	name: string;
	type: 'polkadot' | 'kusama' | 'solo' | 'test';
	logo: StaticImageData;
	selected: boolean;
}

interface AddNetworksModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (selectedNetworks: { id: string; name: string; removable: boolean }[]) => void;
	selectedNetworks: { id: string; name: string; removable: boolean }[];
}

const networkGroups = {
	kusamaParachains: [
		{ id: 'kusama', name: 'Kusama', type: 'kusama' as const, logo: KusamaLogo, selected: false },
		{ id: 'moonriver', name: 'Moonriver', type: 'kusama' as const, logo: MoonriverLogo, selected: false }
	],
	polkadotParachains: [
		{ id: 'polkadot', name: 'Polkadot', type: 'polkadot' as const, logo: PolkadotLogo, selected: false },
		{ id: 'collectives', name: 'Collectives', type: 'polkadot' as const, logo: CollectivesLogo, selected: false },
		{ id: 'moonbeam', name: 'Moonbeam', type: 'polkadot' as const, logo: MoonbeamLogo, selected: false },
		{ id: 'pendulum', name: 'Pendulum', type: 'polkadot' as const, logo: PendulumLogo, selected: false }
	],
	soloChains: [
		{ id: 'cere', name: 'Cere', type: 'solo' as const, logo: CereLogo, selected: false },
		{ id: 'polkadex', name: 'Polkadex', type: 'solo' as const, logo: PolkadexLogo, selected: false },
		{ id: 'polymesh', name: 'Polymesh', type: 'solo' as const, logo: PolymeshLogo, selected: false }
	],
	testChains: [
		{ id: 'moonbase', name: 'Moonbase', type: 'test' as const, logo: MoonbaseLogo, selected: false },
		{ id: 'polymesh-test', name: 'Polymesh-Test', type: 'test' as const, logo: PolymeshLogo, selected: false },
		{ id: 'westend', name: 'Westend', type: 'test' as const, logo: WestendLogo, selected: false },
		{ id: 'paseo', name: 'Paseo', type: 'test' as const, logo: PaseoLogo, selected: false }
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
	const t = useTranslations();
	const allSelected = groupNetworks.every((network) => network.selected);

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<Image
					src={Parachainlogo}
					alt=''
					width={20}
					height={20}
					className='rounded-full object-cover'
				/>{' '}
				<span className='text-sm font-medium text-text_primary'>{title}</span>
				<div className='ml-auto flex items-center gap-2'>
					<span className='text-xs text-text_primary'>{t('Profile.Settings.Notifications.all')}</span>
					<Switch
						checked={allSelected}
						onCheckedChange={() => onToggleAll(groupKey)}
					/>
				</div>
			</div>

			<div className='grid grid-cols-3 gap-2'>
				{groupNetworks.map((network) => (
					<button
						key={network.id}
						type='button'
						onClick={() => onToggleNetwork(groupKey, network.id)}
						className={`flex items-center gap-2 rounded-full p-2 transition-all ${network.selected ? 'border border-bg_pink bg-progress_pink_bg' : 'border-0 hover:bg-gray-50'}`}
					>
						<Image
							src={network.logo}
							alt={network.name}
							width={16}
							height={16}
							className='rounded-full object-cover'
						/>
						<span className='text-text_secondary text-xs'>{network.name}</span>
					</button>
				))}
			</div>
		</div>
	);
}

function AddNetworksModal({ open, onClose, onConfirm, selectedNetworks }: AddNetworksModalProps) {
	const t = useTranslations();
	const [networks, setNetworks] = useState(networkGroups);

	useEffect(() => {
		if (open) {
			const selectedNetworkIds = selectedNetworks.map((network) => network.id);

			const updatedNetworks = {
				kusamaParachains: networkGroups.kusamaParachains.map((network) => ({
					...network,
					selected: selectedNetworkIds.includes(network.id)
				})),
				polkadotParachains: networkGroups.polkadotParachains.map((network) => ({
					...network,
					selected: selectedNetworkIds.includes(network.id)
				})),
				soloChains: networkGroups.soloChains.map((network) => ({
					...network,
					selected: selectedNetworkIds.includes(network.id)
				})),
				testChains: networkGroups.testChains.map((network) => ({
					...network,
					selected: selectedNetworkIds.includes(network.id)
				}))
			};

			setNetworks(updatedNetworks);
		}
	}, [open, selectedNetworks]);

	const toggleNetwork = (groupKey: keyof typeof networkGroups, networkId: string) => {
		setNetworks((prev) => ({
			...prev,
			[groupKey]: prev[groupKey].map((network) => (network.id === networkId ? { ...network, selected: !network.selected } : network))
		}));
	};

	const toggleAll = (groupKey: keyof typeof networkGroups) => {
		setNetworks((prev) => {
			const allSelected = prev[groupKey].every((n) => n.selected);
			return {
				...prev,
				[groupKey]: prev[groupKey].map((n) => ({ ...n, selected: !allSelected }))
			};
		});
	};

	const handleConfirm = () => {
		const selectedNetworksList = Object.values(networks)
			.flat()
			.filter((network) => network.selected);

		const existingNetworkIds = selectedNetworks.map((network) => network.id);
		const networksToAdd = selectedNetworksList
			.filter((network) => !existingNetworkIds.includes(network.id))
			.map((network) => ({
				id: network.id,
				name: network.name,
				removable: true
			}));

		onConfirm(networksToAdd);
		onClose();

		setNetworks(networkGroups);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isOpen && onClose()}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Plus className='text-text_secondary h-5 w-5' />
							<DialogTitle>{t('Profile.Settings.Notifications.Modals.addNetworks')}</DialogTitle>
						</div>
					</div>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.Modals.pleaseSelectNetworks')}</p>

					<div className='space-y-6'>
						<NetworkGroup
							title={t('Profile.Settings.Notifications.Modals.kusamaAndParachains')}
							groupKey='kusamaParachains'
							networks={networks.kusamaParachains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title={t('Profile.Settings.Notifications.Modals.polkadotAndParachains')}
							groupKey='polkadotParachains'
							networks={networks.polkadotParachains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title={t('Profile.Settings.Notifications.Modals.soloChains')}
							groupKey='soloChains'
							networks={networks.soloChains}
							onToggleAll={toggleAll}
							onToggleNetwork={toggleNetwork}
						/>

						<NetworkGroup
							title={t('Profile.Settings.Notifications.Modals.testChains')}
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
							disabled={false}
						>
							{t('Profile.Settings.Notifications.Modals.cancel')}
						</Button>
						<Button
							onClick={handleConfirm}
							className='flex-1 bg-text_pink disabled:opacity-50'
							disabled={
								!Object.values(networks)
									.flat()
									.some((network) => network.selected)
							}
						>
							{t('Profile.Settings.Notifications.Modals.confirm')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddNetworksModal;
