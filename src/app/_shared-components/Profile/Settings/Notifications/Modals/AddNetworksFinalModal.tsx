// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Plus } from 'lucide-react';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';

interface Network {
	id: string;
	name: string;
	logo: string;
}

interface AddNetworksFinalModalProps {
	open: boolean;
	onClose: () => void;
	onGoBack: () => void;
	onGoAhead: () => void;
	networks: Network[];
}

function AddNetworksFinalModal({ open, onClose, onGoBack, onGoAhead, networks }: AddNetworksFinalModalProps) {
	const t = useTranslations('Profile.Settings.Notifications.Modals');

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
							<DialogTitle>{t('addNetworks')}</DialogTitle>
						</div>
					</div>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-text_secondary text-sm'>{t('preExistingSettingsWillBeChanged')}</p>

					<div className='flex flex-wrap gap-2'>
						{networks.map((network) => (
							<div
								key={network.id}
								className='flex items-center gap-2 rounded-full border px-3 py-1'
							>
								<img
									src={network.logo}
									alt={network.name}
									width={16}
									height={16}
									className='rounded-full object-cover'
									onError={(e) => {
										e.currentTarget.src = PolkadotLogo.src;
									}}
								/>
								<span className='text-sm text-text_primary'>{network.name}</span>
							</div>
						))}
					</div>

					<div className='flex gap-2 pt-4'>
						<Button
							variant='outline'
							onClick={onGoBack}
							className='flex-1'
						>
							{t('goBack')}
						</Button>
						<Button
							onClick={onGoAhead}
							className='flex-1 bg-pink-500 hover:bg-pink-600'
						>
							{t('goAhead')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddNetworksFinalModal;
