// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { CheckCircle, X, Info } from 'lucide-react';

interface ConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	networkName: string;
}

function ConfirmationModal({ open, onClose, onConfirm, networkName }: ConfirmationModalProps) {
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
							<CheckCircle className='h-5 w-5 text-social_green' />
							<DialogTitle>{t('confirmation')}</DialogTitle>
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
					<p className='text-sm text-text_primary'>{t('areYouSureYouWant', { networkName })}</p>

					<div className='flex items-start gap-3 rounded-lg p-3'>
						<Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-bg_blue' />
						<p className='text-xs text-bg_blue'>{t('primaryNetworkSettingsInfo')}</p>
					</div>

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
							className='flex-1 bg-text_pink'
						>
							{t('confirm')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ConfirmationModal;
