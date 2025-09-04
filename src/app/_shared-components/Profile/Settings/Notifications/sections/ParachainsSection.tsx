// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ChevronDown, Plus } from 'lucide-react';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { INetworkSettings, IParachain } from '@/_shared/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import ParachainsIcon from '@assets/icons/notification-settings/parachains.svg';
import NetworkBadge from '../components/NetworkBadge';
import AddNetworksModal from '../Modals/AddNetworksModal';

import ImportPrimaryNetworkModal from '../Modals/ImportPrimaryNetworkModal';
import AddNetworksFinalModal from '../Modals/AddNetworksFinalModal';
import classes from '../Notifications.module.scss';

const getNetworkLogo = (networkId: string, parachainsData?: IParachain[]): string => {
	if (!parachainsData) return PolkadotLogo.src;

	const parachain = parachainsData.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === networkId.toLowerCase() || p.name.toLowerCase() === networkId.toLowerCase());

	return parachain?.logoURL || PolkadotLogo.src;
};

function ParachainsSection() {
	const t = useTranslations();
	const currentNetwork = getCurrentNetwork();
	const { preferences, updateNetworkPreference, importNetworkSettings, bulkUpdateNetworkPreferences } = useNotificationPreferences(true);

	const [selectedNetworks, setSelectedNetworks] = useState<INetworkSettings[]>([]);
	const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set());
	const [pendingAdditions, setPendingAdditions] = useState<INetworkSettings[]>([]);
	const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

	const { data: parachainsData } = useQuery({
		queryKey: ['parachains'],
		queryFn: async () => {
			const response = await fetch('/parachains.json');
			return response.json() as Promise<IParachain[]>;
		}
	});

	useEffect(() => {
		if (!preferences?.networkPreferences) {
			setSelectedNetworks([]);
			return;
		}

		const userNetworks = Object.keys(preferences.networkPreferences);
		const networks: INetworkSettings[] = [];

		userNetworks.forEach((networkId) => {
			if (networkId === currentNetwork) return;

			if (networkId.includes('.')) return;

			const networkPrefs = preferences.networkPreferences[networkId];
			if (networkPrefs?.enabled !== false && !pendingRemovals.has(networkId)) {
				const formattedName = networkId
					.split(/[-_]/)
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
					.join(' ');

				networks.push({
					id: networkId,
					name: formattedName,
					removable: true
				});
			}
		});

		pendingAdditions.forEach((pendingNetwork) => {
			if (!networks.some((n) => n.id === pendingNetwork.id) && pendingNetwork.id !== currentNetwork) {
				networks.push(pendingNetwork);
			}
		});

		setSelectedNetworks(networks);
	}, [preferences?.networkPreferences, currentNetwork, pendingRemovals, pendingAdditions]);

	useEffect(() => {
		if (!preferences?.networkPreferences) return;

		const serverNetworks = Object.keys(preferences.networkPreferences).filter(
			(networkId) => !networkId.includes('.') && preferences.networkPreferences[networkId]?.enabled !== false
		);

		const additionsCompleted = pendingAdditions.every((pendingNetwork) => serverNetworks.includes(pendingNetwork.id));

		const removalsCompleted = Array.from(pendingRemovals).every((networkId) => !serverNetworks.includes(networkId));

		if (additionsCompleted && pendingAdditions.length > 0) {
			setPendingAdditions([]);
			setPendingOperations((prev) => {
				const newSet = new Set(prev);
				pendingAdditions.forEach((network) => {
					newSet.delete(`add-${network.id}`);
				});
				return newSet;
			});
		}

		if (removalsCompleted && pendingRemovals.size > 0) {
			const removalsArray = Array.from(pendingRemovals);
			setPendingRemovals(new Set());
			setPendingOperations((prev) => {
				const newSet = new Set(prev);
				removalsArray.forEach((networkId) => {
					newSet.delete(`remove-${networkId}`);
				});
				return newSet;
			});
		}
	}, [preferences?.networkPreferences, pendingAdditions, pendingRemovals]);

	useEffect(() => {
		if (pendingOperations.size > 0) {
			const timeout = setTimeout(() => {
				console.warn('Clearing pending operations due to timeout');
				setPendingRemovals(new Set());
				setPendingAdditions([]);
				setPendingOperations(new Set());
			}, 10000);

			return () => clearTimeout(timeout);
		}

		return undefined;
	}, [pendingOperations.size]);

	const currentNetworkPrefs = preferences?.networkPreferences?.[currentNetwork];
	const [parachainSettings, setParachainSettings] = useState({
		setPrimaryNetworkSettings: currentNetworkPrefs?.isPrimary || false,
		importPrimaryNetworkSettings: currentNetworkPrefs?.importPrimarySettings || false
	});

	useEffect(() => {
		if (currentNetworkPrefs) {
			setParachainSettings({
				setPrimaryNetworkSettings: currentNetworkPrefs.isPrimary || false,
				importPrimaryNetworkSettings: currentNetworkPrefs.importPrimarySettings || false
			});
		}
	}, [currentNetworkPrefs]);

	const [networkModals, setNetworkModals] = useState({
		addNetworks: false,
		importPrimary: false,
		addNetworksFinal: false
	});

	const [primaryNetwork] = useState(
		currentNetwork
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	);

	const openNetworkModal = (modalName: keyof typeof networkModals) => {
		setNetworkModals((prev) => ({ ...prev, [modalName]: true }));
	};

	const closeNetworkModal = (modalName: keyof typeof networkModals) => {
		setNetworkModals((prev) => ({ ...prev, [modalName]: false }));
	};

	const removeNetwork = (networkId: string) => {
		setPendingRemovals((prev) => new Set([...prev, networkId]));

		setPendingOperations((prev) => new Set([...prev, `remove-${networkId}`]));

		updateNetworkPreference(networkId, {
			enabled: false,
			isPrimary: false,
			importPrimarySettings: false
		});
	};

	const addNetwork = () => {
		openNetworkModal('addNetworks');
	};

	const handleAddNetworksConfirm = async (networks: INetworkSettings[]) => {
		if (networks.length === 0) return;

		setPendingAdditions((prev) => [...prev, ...networks]);

		networks.forEach((network) => {
			setPendingOperations((prev) => new Set([...prev, `add-${network.id}`]));
		});

		try {
			if (networks.length > 1) {
				const updates = networks.map((network) => ({
					section: 'networks',
					key: network.id,
					value: {
						enabled: true,
						isPrimary: false,
						importPrimarySettings: false
					}
				}));
				await bulkUpdateNetworkPreferences(updates);
			} else {
				updateNetworkPreference(networks[0].id, {
					enabled: true,
					isPrimary: false,
					importPrimarySettings: false
				});
			}
		} catch (error) {
			console.error('Failed to add networks:', error);
			setPendingAdditions((prev) => prev.filter((pending) => !networks.some((network) => network.id === pending.id)));
			networks.forEach((network) => {
				setPendingOperations((prev) => {
					const newSet = new Set(prev);
					newSet.delete(`add-${network.id}`);
					return newSet;
				});
			});
		}
	};

	const handleImportPrimaryConfirm = () => {
		closeNetworkModal('importPrimary');
		openNetworkModal('addNetworksFinal');
	};

	const handleFinalGoAhead = () => {
		closeNetworkModal('addNetworksFinal');

		const networksToImport = selectedNetworks.filter((network) => network.id !== currentNetwork);

		networksToImport.forEach((network) => {
			importNetworkSettings(currentNetwork, network.id);
		});
	};

	const handleSetPrimaryNetworkSettings = (checked: boolean) => {
		setParachainSettings((prev) => ({
			...prev,
			setPrimaryNetworkSettings: checked
		}));

		updateNetworkPreference(currentNetwork, {
			enabled: true,
			isPrimary: checked,
			importPrimarySettings: currentNetworkPrefs?.importPrimarySettings || false
		});
	};

	const handleImportPrimaryNetworkSettings = async (checked: boolean) => {
		setParachainSettings((prev) => ({
			...prev,
			importPrimaryNetworkSettings: checked,
			setPrimaryNetworkSettings: checked ? true : prev.setPrimaryNetworkSettings
		}));

		try {
			if (checked) {
				const parachainNetworks = selectedNetworks;

				if (parachainNetworks.length > 0) {
					const updates = [
						{
							section: 'networks',
							key: currentNetwork,
							value: {
								enabled: true,
								isPrimary: true,
								importPrimarySettings: true
							}
						},
						...parachainNetworks.map((network) => ({
							section: 'networks',
							key: network.id,
							value: {
								enabled: true,
								isPrimary: false,
								importPrimarySettings: true
							}
						}))
					];

					await bulkUpdateNetworkPreferences(updates);

					parachainNetworks.forEach((network) => {
						importNetworkSettings(currentNetwork, network.id);
					});
				} else {
					updateNetworkPreference(currentNetwork, {
						enabled: true,
						isPrimary: true,
						importPrimarySettings: true
					});
				}
			} else {
				updateNetworkPreference(currentNetwork, {
					enabled: currentNetworkPrefs?.enabled || true,
					isPrimary: currentNetworkPrefs?.isPrimary || false,
					importPrimarySettings: false
				});
			}
		} catch {
			setParachainSettings((prev) => ({
				...prev,
				importPrimaryNetworkSettings: !checked,
				setPrimaryNetworkSettings: !checked ? prev.setPrimaryNetworkSettings : false
			}));
		}
	};
	const finalNetworks = selectedNetworks.map((network) => ({
		id: network.id,
		name: network.name,
		logo: getNetworkLogo(network.id, parachainsData)
	}));

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
							<div className='space-y-2'>
								<p className='text-text_secondary text-sm'>
									Current Network:{' '}
									<span className='font-semibold text-text_primary'>
										{currentNetwork
											.split(/[-_]/)
											.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
											.join(' ')}
									</span>
								</p>
								<p className='text-text_secondary text-sm'>
									Manage your notification settings for parachain networks. Add multiple parachains to receive notifications across the Polkadot ecosystem.
								</p>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-wrap gap-3'>
									{selectedNetworks.map((network) => (
										<NetworkBadge
											key={network.id}
											id={network.id}
											name={network.name}
											logo={getNetworkLogo(network.id, parachainsData)}
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

			<AddNetworksModal
				open={networkModals.addNetworks}
				onClose={() => closeNetworkModal('addNetworks')}
				onConfirm={handleAddNetworksConfirm}
				selectedNetworks={selectedNetworks}
			/>

			<ImportPrimaryNetworkModal
				open={networkModals.importPrimary}
				onClose={() => closeNetworkModal('importPrimary')}
				onConfirm={handleImportPrimaryConfirm}
				primaryNetwork={primaryNetwork}
				networks={finalNetworks}
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
