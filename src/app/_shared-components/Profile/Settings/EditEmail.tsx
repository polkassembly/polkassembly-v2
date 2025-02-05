// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { Button } from '../../Button';
import { Input } from '../../Input';

function EditEmail({ oldEmail, onSuccess, userId, onClose }: { oldEmail: string; onSuccess?: (newEmail: string) => void; userId: number; onClose?: () => void }) {
	const t = useTranslations();
	const { user } = useUser();
	const [newEmail, setNewEmail] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const handleEditEmail = async () => {
		if (!newEmail || !user?.id || user.id !== userId) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.editUserProfile({ userId: user.id, email: newEmail });

		if (data && !error) {
			onSuccess?.(newEmail);
			onClose?.();
		}

		setLoading(false);
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<div>
				<p className='text-text_primary'>{t('Profile.Settings.oldEmail')}</p>
				<Input
					defaultValue={oldEmail}
					disabled
				/>
			</div>
			<div>
				<p className='text-text_primary'>{t('Profile.Settings.newEmail')}</p>
				<Input
					placeholder='Enter your email'
					value={newEmail}
					type='email'
					onChange={(e) => setNewEmail(e.target.value)}
				/>
			</div>
			<div className='flex justify-end'>
				<Button
					disabled={!newEmail || !user?.id || user.id !== userId}
					onClick={handleEditEmail}
					isLoading={loading}
				>
					{t('Profile.Settings.save')}
				</Button>
			</div>
		</div>
	);
}

export default EditEmail;
