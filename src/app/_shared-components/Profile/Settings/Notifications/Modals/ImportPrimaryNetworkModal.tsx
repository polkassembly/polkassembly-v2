// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Download } from 'lucide-react';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';

interface Network {
	id: string;
	name: string;
	logo: string;
}

interface ImportPrimaryNetworkModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	primaryNetwork: string;
	primaryNetworkLogo?: string;
	networks: Network[];
}

function ImportPrimaryNetworkModal({ open, onClose, onConfirm, primaryNetwork, primaryNetworkLogo, networks }: ImportPrimaryNetworkModalProps) {
	const t = useTranslations('Profile.Settings.Notifications.Modals');

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isOpen && onClose()}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Download className='text-text_secondary h-5 w-5' />
							<DialogTitle>{t('addNetworks')}</DialogTitle>
						</div>
					</div>
				</DialogHeader>

				<div className='space-y-4'>
					<p className='text-sm text-text_primary'>{t('preExistingSettingsWillBeChanged')}</p>

					<div className='rounded-lg bg-gray-50 p-3'>
						<div className='flex flex-wrap gap-2'>
							{networks.map((network) => (
								<div
									key={network.id}
									className='flex items-center gap-2 rounded-full border bg-white px-3 py-1'
								>
									<img
										src={network.logo}
										alt={network.name}
										width={12}
										height={12}
										className='rounded-full object-cover'
										onError={(e) => {
											e.currentTarget.src = PolkadotLogo.src;
										}}
									/>
									<span className='text-xs text-text_primary'>{network.name}</span>
								</div>
							))}
						</div>
					</div>

					<div className='flex items-center justify-center'>
						<div className='flex items-center gap-2 rounded-full border-2 border-pink-500 px-4 py-2'>
							<img
								src={primaryNetworkLogo || PolkadotLogo.src}
								alt={primaryNetwork}
								width={16}
								height={16}
								className='rounded-full object-cover'
								onError={(e) => {
									e.currentTarget.src = PolkadotLogo.src;
								}}
							/>
							<span className='text-sm font-medium text-text_primary'>{primaryNetwork}</span>
						</div>
					</div>

					<p className='text-text_secondary text-center text-sm'>{t('isSetAsYourPrimaryNetwork')}</p>

					<p className='text-sm text-text_primary'>{t('areYouSureYouWantToImport', { primaryNetwork })}</p>

					<div className='flex gap-2 pt-4'>
						<Button
							variant='outline'
							onClick={onClose}
							className='flex-1'
						>
							{t('cancel')}
						</Button>
						<Button
							onClick={onConfirm}
							className='flex-1 bg-bg_pink'
						>
							{t('confirm')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ImportPrimaryNetworkModal;
