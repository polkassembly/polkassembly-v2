// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ChangeEvent, RefObject, useRef, useState } from 'react';
import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { NETWORKS_DISPLAY_DATA } from '@/_shared/_constants/networksDisplayData';
import { getNetworkLogo } from '@/app/_client-utils/getNetworkLogo';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../Select/Select';
import RenderNetworkSection from './RenderNetworkSection';
import styles from './NetworkDropdown.module.scss';
import NetworkInput from './NetworkInput';

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
								src={getNetworkLogo(network) || WestendLogo}
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
