// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { Button } from '../../Button';
import { Input } from '../../Input';

function EditUsername({ oldUsername, onSuccess, userId, onClose }: { oldUsername: string; onSuccess?: (newUsername: string) => void; userId: number; onClose?: () => void }) {
	const t = useTranslations();
	const { user } = useUser();
	const [newUsername, setNewUsername] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const handleEditUsername = async () => {
		if (!newUsername || !user?.id || user.id !== userId) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.editUserProfile({ userId: user.id, username: newUsername });

		if (data && !error) {
			onSuccess?.(newUsername);
			onClose?.();
		}

		setLoading(false);
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<div>
				<p className='text-text_primary'>{t('Profile.Settings.oldUsername')}</p>
				<Input
					defaultValue={oldUsername}
					disabled
				/>
			</div>
			<div>
				<p className='text-text_primary'>{t('Profile.Settings.newUsername')}</p>
				<Input
					placeholder='Enter your username'
					value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)}
				/>
			</div>
			<div className='flex justify-end'>
				<Button
					disabled={!newUsername || !user?.id || user.id !== userId}
					onClick={handleEditUsername}
					isLoading={loading}
				>
					{t('Profile.Settings.save')}
				</Button>
			</div>
		</div>
	);
}

export default EditUsername;
