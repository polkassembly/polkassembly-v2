// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown, Plus } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import ParachainsIcon from '@assets/icons/notification-settings/parachains.svg';
import NetworkBadge from '../components/NetworkBadge';
import AddNetworksModal from '../Modals/AddNetworksModal';

import ImportPrimaryNetworkModal from '../Modals/ImportPrimaryNetworkModal';
import AddNetworksFinalModal from '../Modals/AddNetworksFinalModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
import classes from '../Notifications.module.scss';

interface INetworkSettings {
	id: string;
	name: string;
	removable: boolean;
}
const getNetworkLogo = (networkId: string): string => {
	const logoMap: Record<string, string> = {
		polkadot: PolkadotLogo.src,
		kusama: KusamaLogo.src,
		moonbeam: MoonbeamLogo.src,
		moonriver: MoonriverLogo.src,
		collectives: CollectivesLogo.src,
		pendulum: PendulumLogo.src,
		cere: CereLogo.src,
		polkadex: PolkadexLogo.src,
		polymesh: PolymeshLogo.src,
		'polymesh-test': PolymeshLogo.src,
		moonbase: MoonbaseLogo.src,
		'moonbase-alpha': MoonbaseLogo.src,
		westend: WestendLogo.src,
		paseo: PaseoLogo.src
	};

	return logoMap[networkId.toLowerCase()] || PolkadotLogo.src;
};

function ParachainsSection() {
	const t = useTranslations();
	const currentNetwork = getCurrentNetwork();
	const { preferences, updateNetworkPreference, importNetworkSettings, bulkUpdateNetworkPreferences } = useNotificationPreferences(true);

	const [selectedNetworks, setSelectedNetworks] = useState<INetworkSettings[]>([]);
	const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!preferences?.networkPreferences) {
			setSelectedNetworks([]);
			return;
		}

		const userNetworks = Object.keys(preferences.networkPreferences);
		const networks: INetworkSettings[] = [];

		const currentNetworkPrefs = preferences.networkPreferences[currentNetwork];
		if (currentNetworkPrefs?.enabled !== false) {
			const formattedCurrentName = currentNetwork
				.split(/[-_]/)
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(' ');

			networks.push({
				id: currentNetwork,
				name: formattedCurrentName,
				removable: false
			});
		}

		userNetworks.forEach((networkId) => {
			if (networkId === currentNetwork) return;

			if (networkId.includes('.') && !['polymesh-test', 'moonbase-alpha'].includes(networkId)) return;

			const networkPrefs =
				preferences?.networkPreferences && Object.prototype.hasOwnProperty.call(preferences.networkPreferences, networkId) ? preferences.networkPreferences[networkId] : undefined;

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

		setSelectedNetworks(networks);
	}, [preferences?.networkPreferences, currentNetwork, pendingRemovals]);

	useEffect(() => {
		if (!preferences?.networkPreferences) return;

		const networkPrefs = preferences.networkPreferences as Record<string, { enabled?: boolean } | undefined>;
		const serverNetworks: string[] = Object.keys(networkPrefs).filter((networkId) => networkPrefs[networkId]?.enabled !== false);

		const removalsCompleted = Array.from(pendingRemovals).every((networkId) => !serverNetworks.includes(networkId));

		if (removalsCompleted && pendingRemovals.size > 0) {
			setPendingRemovals(new Set());
		}
	}, [preferences?.networkPreferences, pendingRemovals]);

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
		addNetworksFinal: false,
		confirmation: false
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
		setSelectedNetworks((prev) => prev.filter((network) => network.id !== networkId));

		setPendingRemovals((prev) => new Set([...prev, networkId]));

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

		setSelectedNetworks((prev) => [...prev, ...networks]);

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
			setSelectedNetworks((prev) => prev.filter((existing) => !networks.some((network) => network.id === existing.id)));
		}
	};

	const handleImportPrimaryConfirm = () => {
		closeNetworkModal('importPrimary');
		openNetworkModal('addNetworksFinal');
	};

	const handleFinalGoAhead = async () => {
		closeNetworkModal('addNetworksFinal');

		const networksToImport = selectedNetworks.filter((network) => network.id !== currentNetwork);

		try {
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
				...networksToImport.map((network) => ({
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

			if (networksToImport.length > 0) {
				const importResults = await Promise.allSettled(networksToImport.map((network) => importNetworkSettings(currentNetwork, network.id)));

				const failedImports = importResults.map((result, index) => (result.status === 'rejected' ? networksToImport[index] : null)).filter(Boolean);

				if (failedImports.length > 0) {
					console.error('Some network imports failed:', failedImports);
				}
			}
		} catch {
			setParachainSettings((prev) => ({
				...prev,
				importPrimaryNetworkSettings: false,
				setPrimaryNetworkSettings: false
			}));
		}
	};

	const handleSetPrimaryNetworkSettings = (checked: boolean) => {
		if (checked) {
			openNetworkModal('confirmation');
		} else {
			setParachainSettings((prev) => ({
				...prev,
				setPrimaryNetworkSettings: false
			}));

			updateNetworkPreference(currentNetwork, {
				enabled: true,
				isPrimary: false,
				importPrimarySettings: currentNetworkPrefs?.importPrimarySettings || false
			});
		}
	};

	const handleConfirmPrimaryNetwork = () => {
		closeNetworkModal('confirmation');

		setParachainSettings((prev) => ({
			...prev,
			setPrimaryNetworkSettings: true
		}));

		updateNetworkPreference(currentNetwork, {
			enabled: true,
			isPrimary: true,
			importPrimarySettings: currentNetworkPrefs?.importPrimarySettings || false
		});
	};

	const handleImportPrimaryNetworkSettings = async (checked: boolean) => {
		if (checked) {
			setParachainSettings((prev) => ({
				...prev,
				importPrimaryNetworkSettings: true,
				setPrimaryNetworkSettings: true
			}));

			const otherNetworks = selectedNetworks.filter((network) => network.id !== currentNetwork);

			if (otherNetworks.length > 0) {
				openNetworkModal('importPrimary');
			} else {
				updateNetworkPreference(currentNetwork, {
					enabled: true,
					isPrimary: true,
					importPrimarySettings: true
				});
			}
		} else {
			const allNetworkIds = selectedNetworks.map((network) => network.id);

			try {
				const updates = allNetworkIds.map((networkId) => ({
					section: 'networks',
					key: networkId,
					value: {
						enabled: preferences?.networkPreferences?.[networkId]?.enabled || true,
						isPrimary: networkId === currentNetwork ? currentNetworkPrefs?.isPrimary || false : false,
						importPrimarySettings: false
					}
				}));

				await bulkUpdateNetworkPreferences(updates);

				setParachainSettings((prev) => ({
					...prev,
					importPrimaryNetworkSettings: false
				}));
			} catch {
				setParachainSettings((prev) => ({
					...prev,
					importPrimaryNetworkSettings: true
				}));
			}
		}
	};
	const finalNetworks = selectedNetworks
		.filter((network) => network.id !== currentNetwork)
		.map((network) => ({
			id: network.id,
			name: network.name,
			logo: getNetworkLogo(network.id)
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
							{t('Profile.Settings.Notifications.parachains')}
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
									{t('Profile.Settings.Notifications.currentNetwork')}{' '}
									<span className='font-semibold text-text_primary'>
										{currentNetwork
											.split(/[-_]/)
											.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
											.join(' ')}
									</span>
								</p>
								<p className='text-text_secondary text-sm'>{t('Profile.Settings.Notifications.manageNotificationSettings')}</p>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-wrap gap-3'>
									{selectedNetworks.map((network) => (
										<NetworkBadge
											key={network.id}
											id={network.id}
											name={network.name}
											logo={getNetworkLogo(network.id)}
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
										<span className='text-sm'>{t('Profile.Settings.Notifications.addNetworks')}</span>
									</button>
								</div>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<Checkbox
										checked={parachainSettings.setPrimaryNetworkSettings}
										onCheckedChange={handleSetPrimaryNetworkSettings}
									/>
									<span className='text-sm text-text_pink'>{t('Profile.Settings.Notifications.setPrimaryNetworkSettings')}</span>
								</div>

								<div className='flex items-center gap-2'>
									<Checkbox
										checked={parachainSettings.importPrimaryNetworkSettings}
										onCheckedChange={handleImportPrimaryNetworkSettings}
									/>
									<span className='text-sm text-text_pink'>{t('Profile.Settings.Notifications.importPrimaryNetworkSettings')}</span>
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

			<ConfirmationModal
				open={networkModals.confirmation}
				onClose={() => {
					closeNetworkModal('confirmation');
					setParachainSettings((prev) => ({
						...prev,
						setPrimaryNetworkSettings: false
					}));
				}}
				onConfirm={handleConfirmPrimaryNetwork}
				networkName={primaryNetwork}
			/>

			<ImportPrimaryNetworkModal
				open={networkModals.importPrimary}
				onClose={() => {
					closeNetworkModal('importPrimary');
					setParachainSettings((prev) => ({
						...prev,
						importPrimaryNetworkSettings: false,
						setPrimaryNetworkSettings: prev.setPrimaryNetworkSettings
					}));
				}}
				onConfirm={handleImportPrimaryConfirm}
				primaryNetwork={primaryNetwork}
				primaryNetworkLogo={getNetworkLogo(currentNetwork)}
				networks={finalNetworks}
			/>

			<AddNetworksFinalModal
				open={networkModals.addNetworksFinal}
				onClose={() => {
					closeNetworkModal('addNetworksFinal');
					setParachainSettings((prev) => ({
						...prev,
						importPrimaryNetworkSettings: false,
						setPrimaryNetworkSettings: prev.setPrimaryNetworkSettings
					}));
				}}
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
