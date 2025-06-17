// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChangeEvent, RefObject, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image, { StaticImageData } from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
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
import PaseoLogo from '@assets/parachain-logos/paseo-logo.png';
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
import NetworkInput from './NetworkInput';
import styles from './NetworkDropdown.module.scss';
import RenderNetworkSection from './RenderNetworkSection';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../Select/Select';

interface INetworkDisplayData {
	polkadot: {
		[key: string]: StaticImageData;
	};
	kusama: {
		[key: string]: StaticImageData;
	};
	soloChains: {
		[key: string]: StaticImageData;
	};
	testChains: {
		[key: string]: StaticImageData;
	};
}

const NETWORKS_DISPLAY_DATA: INetworkDisplayData = {
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
		Paseo: PaseoLogo,
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
		Object.values(NETWORKS_DISPLAY_DATA)
			.flatMap((category) => Object.keys(category))
			.find((key) => key.toLowerCase() === lowerNetworkKey) || networkKey
	);
};

function NetworkDropdown({ className }: { className?: string }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const network = getCurrentNetwork();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations('Header');
	const categoryDisplayNames: { [key: string]: string } = {
		polkadot: t('polkadot'),
		kusama: t('kusama'),
		soloChains: t('soloChains'),
		testChains: t('testChains')
	};
	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	return (
		<Select
			value={network}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectTrigger
				className={cn('rounded-lg border-border_grey bg-network_dropdown_bg md:rounded-full', className)}
				onClick={() => {
					setIsOpen(true);
				}}
			>
				<SelectValue>
					<div className={styles.selectValueContainer}>
						<div className={styles.selectValue}>
							<Image
								src={NETWORKS_DETAILS[`${network}`].logo}
								alt={getNetworkDisplayName(network)}
								width={24}
								height={24}
								className='object-cover'
							/>
						</div>
						{getNetworkDisplayName(network)}
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className={styles.selectContentContainer}>
				<NetworkInput
					searchInputRef={searchInputRef as RefObject<HTMLInputElement>}
					searchTerm={searchTerm}
					handleSearchChange={handleSearchChange}
				/>
				<div className='overflow-y-auto p-2'>
					{Object.entries(NETWORKS_DISPLAY_DATA).map(([category, networks]) => (
						<RenderNetworkSection
							key={category}
							title={categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category}
							networks={networks}
							searchTerm={searchTerm}
						/>
					))}
				</div>
			</SelectContent>
		</Select>
	);
}

export default NetworkDropdown;
