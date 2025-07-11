// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IdentityService } from '@/app/_client-services/identity_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { ENotificationStatus } from '@/_shared/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../_shared-components/Dialog/Dialog';
import { Button } from '../../../_shared-components/Button';

interface BecomeRegistrarModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function BecomeRegistrarModal({ isOpen, onClose }: BecomeRegistrarModalProps) {
	const t = useTranslations('Judgements');
	const { user } = useUser();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const network = getCurrentNetwork();

	const address = user?.loginAddress;

	const handleBecomeRegistrar = async () => {
		if (!address) {
			toast({
				status: ENotificationStatus.ERROR,
				title: 'Error',
				description: 'Please connect your wallet first'
			});
			return;
		}

		setIsLoading(true);
		try {
			const identityService = await IdentityService.Init(network);
			await identityService.becomeRegistrar({
				address,
				onSuccess: () => {
					toast({
						status: ENotificationStatus.SUCCESS,
						title: 'Success',
						description: 'You have successfully become a registrar'
					});
					onClose();
				},
				onFailed: (errorMessage) => {
					toast({
						status: ENotificationStatus.ERROR,
						title: 'Error',
						description: errorMessage || 'Failed to become registrar'
					});
				}
			});
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: 'Error',
				description: 'Failed to become registrar'
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{t('becomeARegistrar')}</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-4'>
					<p className='text-sm text-gray-600'>{t('registrarDescription')}</p>
					<div className='flex justify-end gap-2'>
						<Button
							variant='outline'
							onClick={onClose}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							onClick={handleBecomeRegistrar}
							isLoading={isLoading}
							disabled={!address}
						>
							{address ? t('becomeARegistrar') : 'Connect Wallet'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default BecomeRegistrarModal;
