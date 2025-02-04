// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useRouter } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { Button } from '../../Button';
import { Input } from '../../Input';

const DELETE_ACCOUNT_CONFIRMATION_TEXT = 'delete';

function DeleteAccount({ userId, onSuccess, onClose }: { userId: number; onSuccess?: () => void; onClose?: () => void }) {
	const { user } = useUser();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const t = useTranslations();
	const [deleteAccountInput, setDeleteAccountInput] = useState('');
	const handleDeleteAccount = async () => {
		if (!user?.id || user.id !== userId) return;
		setLoading(true);
		const { data, error } = await UserProfileClientService.deleteAccount({ userId: user?.id });
		if (data && !error) {
			onSuccess?.();
			onClose?.();
			AuthClientService.logout();
			router.replace('/');
		}
		setLoading(false);
	};
	return (
		<div>
			<p className='text-text_secondary mb-4 text-sm'>{t('Profile.Settings.deleteAccountDescription')}</p>
			<div className='mb-4'>
				<p className='mb-1 text-sm text-text_primary'>
					{t('Profile.Settings.type')} &quot;{DELETE_ACCOUNT_CONFIRMATION_TEXT}&quot; {t('Profile.Settings.belowToConfirm')}
				</p>
				<Input
					value={deleteAccountInput}
					onChange={(e) => setDeleteAccountInput(e.target.value)}
				/>
			</div>
			<Button
				variant='destructive'
				onClick={handleDeleteAccount}
				isLoading={loading}
				disabled={deleteAccountInput !== DELETE_ACCOUNT_CONFIRMATION_TEXT}
			>
				{t('Profile.Settings.deleteMyAccount')}
			</Button>
		</div>
	);
}

export default DeleteAccount;
