// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { Button } from '../../Button';

function DeleteAccount({ userId, onSuccess, onClose }: { userId: number; onSuccess?: () => void; onClose?: () => void }) {
	const { user } = useUser();
	const [loading, setLoading] = useState(false);
	const t = useTranslations();

	const handleDeleteAccount = async () => {
		if (!user?.id || user.id !== userId) return;
		setLoading(true);
		const { data, error } = await UserProfileClientService.deleteAccount({ userId: user?.id });
		if (data && !error) {
			onSuccess?.();
			onClose?.();
		}
		setLoading(false);
	};
	return (
		<div>
			<p className='text-text_secondary mb-4 text-sm'>{t('Profile.Settings.deleteAccountDescription')}</p>
			<Button
				variant='destructive'
				onClick={handleDeleteAccount}
				isLoading={loading}
			>
				{t('Profile.Settings.deleteMyAccount')}
			</Button>
		</div>
	);
}

export default DeleteAccount;
