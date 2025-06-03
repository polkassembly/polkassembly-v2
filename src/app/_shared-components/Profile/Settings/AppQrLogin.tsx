// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import QrCode from 'react-qr-code';
import LoadingLayover from '../../LoadingLayover';

function AppQrLogin() {
	const t = useTranslations();
	const { user } = useUser();
	const generateQrSessionId = async () => {
		if (!user) return null;
		const { data, error } = await AuthClientService.generateQRSession();

		if (error || !data) {
			throw new Error(error?.message || 'Failed to generate QR session');
		}

		return data;
	};

	const {
		data: qrSession,
		isLoading,
		error
	} = useQuery({
		queryKey: ['qr-session', user?.id],
		queryFn: generateQrSessionId,
		enabled: !!user?.id,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchInterval: FIVE_MIN_IN_MILLI,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	return (
		<div className='relative flex flex-col items-center gap-y-2 p-2'>
			{isLoading && <LoadingLayover />}
			{error && <p className='text-sm text-failure'>{error.message}</p>}
			{qrSession && (
				<div className='relative max-w-max rounded-lg bg-white p-2'>
					<QrCode
						value={JSON.stringify(qrSession)}
						size={200}
					/>
				</div>
			)}
			<p className='text-base font-semibold text-text_primary'>{t('Profile.Settings.scanToLoginInApp')}</p>
			<p className='text-sm text-text_primary'>{t('Profile.Settings.appQrLoginDescription')}</p>
		</div>
	);
}

export default AppQrLogin;
