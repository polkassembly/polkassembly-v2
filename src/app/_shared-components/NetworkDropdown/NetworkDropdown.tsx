// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useRef, useState } from 'react';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import AstarLogo from '@assets/parachain-logos/astar-logo.png';
import AcalaLogo from '@assets/parachain-logos/acala-logo.jpg';
import ComposableLogo from '@assets/parachain-logos/composable-finance-logo.png';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import CentrifugeLogo from '@assets/parachain-logos/centrifuge-logo.png';
import CollectivesLogo from '@assets/parachain-logos/collectives-logo.png';
import AmplitudeLogo from '@assets/parachain-logos/amplitude-logo.png';
import BasiliskLogo from '@assets/parachain-logos/basilisk-logo.jpg';
import CalamariLogo from '@assets/parachain-logos/calamari-logo.png';
import HeikoLogo from '@assets/parachain-logos/heiko-logo.png';
import IntegriteeLogo from '@assets/parachain-logos/integritee-logo.png';
import KaruraLogo from '@assets/parachain-logos/karura-logo.jpg';
import KhalaLogo from '@assets/parachain-logos/khala-logo.png';
import MoonriverLogo from '@assets/parachain-logos/moonriver-logo.png';
import RobonomicsLogo from '@assets/parachain-logos/robonomics-logo.jpg';
import SnowLogo from '@assets/parachain-logos/snow-logo.png';
import ShidenLogo from '@assets/parachain-logos/shiden-logo.jpg';
import PicassoLogo from '@assets/parachain-logos/picasso-logo.png';
import TuringLogo from '@assets/parachain-logos/turing-logo.png';
import CurioLogo from '@assets/parachain-logos/curio-logo.jpg';
import EquillibriumLogo from '@assets/parachain-logos/equilibrium-logo.png';
import FrequencyLogo from '@assets/parachain-logos/frequency-logo.png';
import HashedLogo from '@assets/parachain-logos/hashed-logo.png';
import HydradxLogo from '@assets/parachain-logos/hydradx-logo.jpg';
import KiltLogo from '@assets/parachain-logos/kilt-logo.png';
import KylinLogo from '@assets/parachain-logos/kylin-logo.png';
import MoonbeamLogo from '@assets/parachain-logos/moonbeam-logo.png';
import ParallelLogo from '@assets/parachain-logos/parallel-logo.jpg';
import PendulumLogo from '@assets/parachain-logos/pendulum-logo.jpg';
import PolimecLogo from '@assets/parachain-logos/polimec-logo.png';
import ZeitgeistLogo from '@assets/parachain-logos/zeitgeist-logo.png';
import MythosLogo from '@assets/parachain-logos/mythical-logo.png';
import AltairLogo from '@assets/parachain-logos/altair-logo.jpeg';
import GenshiroLogo from '@assets/parachain-logos/genshiro.png';
import GmordieLogo from '@assets/parachain-logos/gmordie-logo.png';
import MoonbaseLogo from '@assets/parachain-logos/moonbase-logo.png';
import TidechainLogo from '@assets/parachain-logos/tidechain-logo.png';
import PichiuLogo from '@assets/parachain-logos/pichiu-logo.png';
import VaraLogo from '@assets/parachain-logos/vara-logo.png';
import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import LaossigmaLogo from '@assets/parachain-logos/laossigma-logo.png';
import AcuityLogo from '@assets/parachain-logos/acuity-logo.jpg';
import AutomataLogo from '@assets/parachain-logos/automata-logo.jpg';
import CrustLogo from '@assets/parachain-logos/crust-logo.png';
import CereLogo from '@assets/parachain-logos/cere-logo.jpg';
import GearLogo from '@assets/parachain-logos/gear-logo.jpg';
import MantaLogo from '@assets/parachain-logos/manta-logo.jpg';
import MyriadLogo from '@assets/parachain-logos/myriad-logo.png';
import PioneerLogo from '@assets/parachain-logos/bitcountrypioneer-logo.jpg';
import PolkadexLogo from '@assets/parachain-logos/polkadex-logo.jpg';
import PhykenLogo from '@assets/parachain-logos/phyken-logo.png';
import PolymeshLogo from '@assets/parachain-logos/polymesh-logo.png';
import XXLogo from '@assets/parachain-logos/xxcoin-logo.png';
import MandalaLogo from '@assets/parachain-logos/mandala-logo.png';
import Image, { StaticImageData } from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select/Select';
import { Input } from '../Input';

interface NetworkDataType {
	[key: string]: {
		[key: string]: StaticImageData;
	};
}

function NetworkDropdown() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState<string>('westend');
	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const NetworkData: NetworkDataType = {
		polkadot: {
			Polkadot: PolkadotLogo,
			Astar: AstarLogo,
			Acala: AcalaLogo,
			Centrifuge: CentrifugeLogo,
			Collectives: CollectivesLogo,
			Composable: ComposableLogo,
			Equilibrium: EquillibriumLogo,
			Frequency: FrequencyLogo,
			Hashed: HashedLogo,
			HydraDX: HydradxLogo,
			Kilt: KiltLogo,
			Kylin: KylinLogo,
			Moonbeam: MoonbeamLogo,
			Parallel: ParallelLogo,
			Pendulum: PendulumLogo,
			Polimec: PolimecLogo,
			Zeitgeist: ZeitgeistLogo,
			Mythos: MythosLogo
		},
		kusama: {
			Kusama: KusamaLogo,
			Altair: AltairLogo,
			Amplitude: AmplitudeLogo,
			Basilisk: BasiliskLogo,
			Calamari: CalamariLogo,
			Crustshadow: CrustLogo,
			Heiko: HeikoLogo,
			Integritee: IntegriteeLogo,
			Karura: KaruraLogo,
			Khala: KhalaLogo,
			Moonriver: MoonriverLogo,
			Robonomics: RobonomicsLogo,
			Snow: SnowLogo,
			Shiden: ShidenLogo,
			Picasso: PicassoLogo,
			Turing: TuringLogo,
			Curio: CurioLogo
		},
		soloChains: {
			Acuity: AcuityLogo,
			Automata: AutomataLogo,
			Crust: CrustLogo,
			Cere: CereLogo,
			Gear: GearLogo,
			Manta: MantaLogo,
			Myriad: MyriadLogo,
			Pioneer: PioneerLogo,
			Polkadex: PolkadexLogo,
			Phyken: PhykenLogo,
			Polymesh: PolymeshLogo,
			XX: XXLogo,
			Mandala: MandalaLogo
		},
		testChains: {
			Paseo: WestendLogo,
			Genshiro: GenshiroLogo,
			Gmordie: GmordieLogo,
			Moonbase: MoonbaseLogo,
			Rolimec: PolimecLogo,
			Shibuya: ShidenLogo,
			Tidechain: TidechainLogo,
			Pichiu: PichiuLogo,
			'Pichiu-Rococo': KylinLogo,
			'Polymesh-Test': PolimecLogo,
			Rococo: WestendLogo,
			Vara: VaraLogo,
			Westend: WestendLogo,
			'Westend-Collectives': WestendLogo,
			Laossigma: LaossigmaLogo
		}
	};
	const getNetworkDisplayName = (networkKey: string): string => {
		const lowerNetworkKey = networkKey.toLowerCase();
		return (
			Object.values(NetworkData)
				.flatMap((category) => Object.keys(category))
				.find((key) => key.toLowerCase() === lowerNetworkKey) || networkKey
		);
	};
	const getNetworkLogo = (networkKey: string): StaticImageData | undefined => {
		const lowerNetworkKey = networkKey.toLowerCase();
		return Object.values(NetworkData)
			.flatMap((category) => Object.entries(category))
			.find(([key]) => key.toLowerCase() === lowerNetworkKey)?.[1];
	};

	const handleNetworkChange = (network: string) => {
		setSelectedNetwork(network.toLowerCase());
		window.location.href = `https://${network.toLowerCase()}.polkassembly.io/`;
		setSearchTerm('');
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		setSearchTerm(e.target.value);
	};

	const renderNetworkSection = (title: string, networks: Record<string, StaticImageData>) => {
		const filteredNetworks = Object.entries(networks).filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

		if (filteredNetworks.length === 0) return null;

		return (
			<div className='mb-4'>
				<h3 className='bg-background_secondary px-4 py-2 text-sm font-medium text-btn_secondary_text'>{title}</h3>
				<div className='grid grid-cols-2 gap-2 px-2'>
					{filteredNetworks.map(([key, logo]) => (
						<SelectItem
							key={key}
							value={key.toLowerCase()}
							className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
						>
							<div className='flex items-center gap-2 py-2'>
								<div className='h-6 w-6 overflow-hidden rounded-full'>
									<Image
										src={logo}
										alt={key}
										width={24}
										height={24}
										className='object-cover'
									/>
								</div>
								<span className='text-sm text-btn_secondary_text'>{key}</span>
							</div>
						</SelectItem>
					))}
				</div>
			</div>
		);
	};

	return (
		<Select
			value={selectedNetwork}
			onValueChange={handleNetworkChange}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectTrigger
				className='bg-network_dropdown_bg w-full rounded-full border-border_grey'
				onClick={() => {
					setIsOpen(true);
					setTimeout(() => {
						searchInputRef.current?.focus();
					}, 0);
				}}
			>
				<SelectValue>
					<div className='flex items-center gap-2 pr-2 text-xs font-semibold text-text_primary'>
						<div className='h-6 w-6 overflow-hidden rounded-full'>
							<Image
								src={getNetworkLogo(selectedNetwork) || WestendLogo}
								alt={getNetworkDisplayName(selectedNetwork)}
								width={24}
								height={24}
								className='object-cover'
							/>
						</div>
						{getNetworkDisplayName(selectedNetwork)}
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent
				className='max-h-[440px] w-[320px] border-border_grey p-0'
				onCloseAutoFocus={(e) => {
					e.preventDefault();
				}}
			>
				<div className='sticky top-0 z-10 border-b border-border_grey bg-bg_modal p-2'>
					<Input
						ref={searchInputRef}
						type='text'
						placeholder='Search networks...'
						value={searchTerm}
						onChange={handleSearchChange}
						className='mb-2'
						onKeyDown={(e) => {
							e.stopPropagation();
						}}
					/>
				</div>
				<div className='overflow-y-auto p-2'>
					{renderNetworkSection('Polkadot & Parachains', NetworkData.polkadot)}
					{renderNetworkSection('Kusama & Parachains', NetworkData.kusama)}
					{renderNetworkSection('Solo Chains', NetworkData.soloChains)}
					{renderNetworkSection('Test Chains', NetworkData.testChains)}
				</div>
			</SelectContent>
		</Select>
	);
}

export default NetworkDropdown;
