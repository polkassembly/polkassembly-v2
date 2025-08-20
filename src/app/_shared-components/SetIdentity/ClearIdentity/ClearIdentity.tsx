// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus } from '@/_shared/types';
import { Separator } from '../../Separator';
import { Button } from '../../Button';

function ClearIdentity({ onSuccess }: { onSuccess: () => void }) {
	const t = useTranslations();
	const { identityService } = useIdentityService();

	const { userPreferences } = useUserPreferences();

	const [loading, setLoading] = useState(false);

	const { toast } = useToast();

	const handleClearIdentity = async () => {
		if (!identityService || !userPreferences.selectedAccount?.address) return;

		setLoading(true);

		await identityService.clearOnChainIdentity({
			address: userPreferences.selectedAccount.address,
			onSuccess: () => {
				toast({
					title: t('SetIdentity.clearIdentitySuccess'),
					description: t('SetIdentity.clearIdentitySuccessDescription'),
					status: ENotificationStatus.SUCCESS
				});
				onSuccess();
				setLoading(false);
			},
			onFailed: (errorMessageFallback?: string) => {
				toast({
					title: t('SetIdentity.clearIdentityFailed'),
					description: errorMessageFallback || t('SetIdentity.clearIdentityFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<p className='text-sm text-text_primary'>{t('SetIdentity.clearIdentityDescription')}</p>
			<Separator />
			<div className='flex items-center justify-end'>
				<Button
					isLoading={loading}
					onClick={handleClearIdentity}
				>
					{t('SetIdentity.clearIdentity')}
				</Button>
			</div>
		</div>
	);
}

export default ClearIdentity;
