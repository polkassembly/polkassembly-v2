// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { INetworkSettings } from '@/_shared/types/notifications';
import ParachainsIcon from '@assets/icons/parachains.svg';
import NetworkBadge from '../components/NetworkBadge';
import AddNetworksModal from '../Modals/AddNetworksModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
import ImportPrimaryNetworkModal from '../Modals/ImportPrimaryNetworkModal';
import AddNetworksFinalModal from '../Modals/AddNetworksFinalModal';
import classes from '../Notifications.module.scss';

function ParachainsSection() {
	const t = useTranslations();

	// Local state for networks
	const [selectedNetworks, setSelectedNetworks] = useState<INetworkSettings[]>([
		{ id: 'kusama', name: 'Kusama', color: 'bg-black', removable: false },
		{ id: 'polkadot', name: 'Polkadot', color: 'bg-pink-500', removable: true },
		{ id: 'moonbeam', name: 'Moonbeam', color: 'bg-teal-400', removable: true },
		{ id: 'moonwell', name: 'Moonwell', color: 'bg-purple-600', removable: true }
	]);

	const [parachainSettings, setParachainSettings] = useState({
		setPrimaryNetworkSettings: false,
		importPrimaryNetworkSettings: true
	});

	// Network modals state
	const [networkModals, setNetworkModals] = useState({
		addNetworks: false,
		confirmation: false,
		importPrimary: false,
		addNetworksFinal: false
	});

	const [primaryNetwork] = useState('Kusama');

	const openNetworkModal = (modalName: keyof typeof networkModals) => {
		setNetworkModals((prev) => ({ ...prev, [modalName]: true }));
	};

	const closeNetworkModal = (modalName: keyof typeof networkModals) => {
		setNetworkModals((prev) => ({ ...prev, [modalName]: false }));
	};

	const removeNetwork = (networkId: string) => {
		setSelectedNetworks((prev) => prev.filter((network) => network.id !== networkId));
	};

	const addNetwork = () => {
		openNetworkModal('addNetworks');
	};

	const handleAddNetworksConfirm = (networks: unknown[]) => {
		setSelectedNetworks(networks as INetworkSettings[]);
		closeNetworkModal('addNetworks');
		openNetworkModal('importPrimary');
	};

	const handleConfirmationConfirm = () => {
		setParachainSettings((prev) => ({
			...prev,
			setPrimaryNetworkSettings: true
		}));
		closeNetworkModal('confirmation');
	};

	const handleConfirmationCancel = () => {
		setParachainSettings((prev) => ({
			...prev,
			setPrimaryNetworkSettings: false
		}));
		closeNetworkModal('confirmation');
	};

	const handleImportPrimaryConfirm = () => {
		closeNetworkModal('importPrimary');
		openNetworkModal('addNetworksFinal');
	};

	const handleFinalGoAhead = () => {
		closeNetworkModal('addNetworksFinal');
		// Handle final network settings import
	};

	const handleSetPrimaryNetworkSettings = (checked: boolean) => {
		if (checked) {
			openNetworkModal('confirmation');
		} else {
			setParachainSettings((prev) => ({
				...prev,
				setPrimaryNetworkSettings: false
			}));
		}
	};

	const handleImportPrimaryNetworkSettings = (checked: boolean) => {
		setParachainSettings((prev) => ({
			...prev,
			importPrimaryNetworkSettings: checked
		}));
	};

	const finalNetworks = [
		{ id: '1', name: 'Polkadot', color: '#E6007A' },
		{ id: '2', name: 'Moonbeam', color: '#53CBC8' },
		{ id: '3', name: 'Moonwell', color: '#1B1B3A' }
	];

	return (
		<>
			<Collapsible className={classes.settingsCollapsible}>
				<CollapsibleTrigger className='w-full'>
					<div className={classes.collapsibleTrigger}>
						<p className={classes.collapsibleTriggerText}>
							<Image
								src={ParachainsIcon}
								alt=''
								width={24}
								className='mt-1'
								height={24}
							/>{' '}
							{t('Profile.Settings.parachains')}
						</p>
						<ChevronDown className={classes.collapsibleTriggerIcon} />
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<Separator />
					<div className={classes.collapsibleContent}>
						<div className='space-y-6'>
							<p className='text-text_secondary text-sm'>Please add the Networks you want to set your notifications for.</p>

							<div className='space-y-4'>
								<div className='flex flex-wrap gap-3'>
									{selectedNetworks.map((network) => (
										<NetworkBadge
											key={network.id}
											id={network.id}
											name={network.name}
											color={network.color}
											removable={network.removable}
											onRemove={removeNetwork}
										/>
									))}

									<button
										type='button'
										onClick={addNetwork}
										className='flex items-center gap-2 rounded-full border border-dashed border-text_pink px-3 py-1 text-text_pink hover:bg-text_pink/5'
									>
										<Plus className='h-3 w-3' />
										<span className='text-sm'>Add Networks</span>
									</button>
								</div>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<Checkbox
										checked={parachainSettings.setPrimaryNetworkSettings}
										onCheckedChange={handleSetPrimaryNetworkSettings}
									/>
									<span className='text-sm text-text_pink'>Set as Primary Network Settings</span>
								</div>

								<div className='flex items-center gap-2'>
									<Checkbox
										checked={parachainSettings.importPrimaryNetworkSettings}
										onCheckedChange={handleImportPrimaryNetworkSettings}
									/>
									<span className='text-sm text-text_pink'>Importing Primary Network Settings to the networks selected above</span>
								</div>
							</div>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Network Settings Modals */}
			<AddNetworksModal
				open={networkModals.addNetworks}
				onClose={() => closeNetworkModal('addNetworks')}
				onConfirm={handleAddNetworksConfirm}
			/>

			<ConfirmationModal
				open={networkModals.confirmation}
				onClose={handleConfirmationCancel}
				onConfirm={handleConfirmationConfirm}
				networkName={primaryNetwork}
			/>

			<ImportPrimaryNetworkModal
				open={networkModals.importPrimary}
				onClose={() => closeNetworkModal('importPrimary')}
				onConfirm={handleImportPrimaryConfirm}
				primaryNetwork={primaryNetwork}
			/>

			<AddNetworksFinalModal
				open={networkModals.addNetworksFinal}
				onClose={() => closeNetworkModal('addNetworksFinal')}
				onGoBack={() => {
					closeNetworkModal('addNetworksFinal');
					openNetworkModal('importPrimary');
				}}
				onGoAhead={handleFinalGoAhead}
				networks={finalNetworks}
			/>
		</>
	);
}

export default ParachainsSection;
